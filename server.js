const path = require('path');
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const cors = require('cors');
const fs = require('fs');
const mongoose = require('mongoose');
const json2csv = require('json2csv').parse;
const bodyParser = require('body-parser');
const Excel = require('exceljs');
const express = require('express');
const AortaData = require('./models/AortaData');
const { dirname } = require('path');
require('dotenv').config({ path: 'variables.env' });



const app = express(); //app은 서버를 만드는 것이다. express() 는 서버를 만드는 함수이다 (const server = express();)

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors());

//Mongoose connection SETUP
mongoose.set('strictQuery', false);
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.mongoDB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'aorta1.html'));
});


app.post('/aorta_data', async (req, res) => {
    const data = req.body; //입력한 데이터
    console.log(data);

    
    let counter = 0;
    const latestRecord = await AortaData.findOne().sort({ order_number: -1 });
    if (latestRecord) {
        counter = latestRecord.order_number;
    }
    const individualData = new AortaData({
        order_number: ++counter,
        institution: data.institution,
        subject_number: data.subject_number,
        enrollment_date: data.enrollment_date,
        op_date: data.op_date,
        name: data.name,
        sex: data.sex,
        age: data.age,
        doctor: data.doctor,
        patient_number: data.patient_number,

    });

    try {
        await individualData.save();
        console.log('Data saved to MongoDB successfully.');
        res.send('Data saved to MongoDB successfully.');
    } catch (err) {
        console.log('Error saving document to collection:', err);
        res.status(500).send('Error saving document to collection');
    }
  

});

app.get('/result', async (req, res) => {
    const aortadatas = await AortaData.find();
    if (aortadatas) {
        res.send(`총 ${aortadatas.length} 명의 환자 데이터가 있습니다.`);
    } else {
        res.send('Something went wrong');
    }
});

app.get('/download', async (req, res) => {
    try {
            const aortadatas = await AortaData.find({});
            const fields = Object.keys(aortadatas[0]._doc); //특별히 ._doc 을 붙이면 mongoose document 임을 의미

            const opts = {
                fields,
                encoding: 'utf-8', // set column head(fields) encoded to utf-8
                withBOM: true, // add BOM to the beginning of the file to indicate encoding
            };
            // Convert the JSON data to CSV format 
            // mongoDB data 를 가져올 때 json2csv 는 헤더를 따로 만들어주지 않는다.
            const csv = json2csv(aortadatas, opts, { fields, header: true });

            res.setHeader('Cache-Control', 'no-cache');
            // Set response headers for file download
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="aorta_data.csv"');

            // Write the CSV data to S3 bucket as a file and send it to the client
            const params = {
                Bucket: process.env.CYCLIC_BUCKET,
                Key: 'aorta_data.csv',
                Body: csv
            };

            

        
            s3.upload(params, async function(err, data) {
                if (err) {
                    console.log('Error uploading file to S3:', err);
                    res.status(500).send('Error uploading file to S3');
                    return;
                }
                
                const s3Params = {
                    Bucket: process.env.CYCLIC_BUCKET,
                    Key: 'aorta_data.csv'
                  };
            
                await s3.getObject(s3Params, function(err, data) {
                if (err) {
                    console.log('Error getting file from S3:', err);
                    res.status(500).send('Error getting file from S3');
                    return;
                }        
                res.send(data.Body);
                });

                
                

                //Delete the CSV file after download is complete
                // fs.unlink('aorta_data.csv', (err) => {
                //     if (err) {
                //         console.log('Error deleting file:', err);
                //     }
                // });
                
            });
        

  } catch (err) {
    console.log('Error:', err);
    res.status(500).send('Error');
  }
});


//mongoDB 연결 후에 Listening to port 3000 만드는 게 좋다
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Listening to port ${PORT}`);
    });
});


