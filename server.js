
const path = require('path');
// const csvWriter = require('csv-writer').createObjectCsvWriter;

const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Excel = require('exceljs');
const express = require('express');
const AortaData = require('./models/AortaData');
const { dirname } = require('path');
require('dotenv').config({ path: 'variables.env' });


const app = express(); //app은 서버를 만드는 것이다. express() 는 서버를 만드는 함수이다 (const server = express();)

const PORT = process.env.PORT || 8080;

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
    res.sendFile(path.join(__dirname, 'aorta.html'));
});


app.post('/aorta_data', async(req, res) => {
    const data = req.body;
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
    individualData.save((err, result) => {
        if(err){
            console.log('Error saving document to collection:', err);
        }else{
            console.log('Data saved to MongoDB successfully.');
            res.send('Data saved to MongoDB successfully.');
        }
    });
       

});

app.get('/result', async(req, res) => {
    const aortadatas = await AortaData.find();
    if (aortadatas) {
        res.send(`총 ${aortadatas.length} 명의 환자 데이터가 있습니다.`);
    }else {
        res.send('Something went wrong');
    }
});

app.get('/download', async (req, res) => {
    try {
            const aortadatas = await AortaData.find();

            let csv = "order_number,subject_number,enrollment_date,op_date,name,sex,age,doctor,patient_number\n";

            aortadatas.forEach(data => {
                csv += `${data.order_number},`;

                csv += `${data.subject_number},`;
                csv += `${data.enrollment_date},`;
                csv += `${data.op_date},`;
                csv += `${data.name},`;
                csv += `${data.sex},`;
                csv += `${data.age},`;
                csv += `${data.doctor},`;
                csv += `${data.patient_number}\n`;
            });


        // JavaScript function to convert CSV string to excel
            
            const workbook = new Excel.Workbook();
            const worksheet = workbook.addWorksheet('AortaData');

            const csvRows = csv.split('\n');
            const header = csvRows[0].split(',');
            const data = [];
            for (let i = 1; i < csvRows.length - 1; i++) {
                const row = csvRows[i].split(',');
                data.push(row);
            }
            worksheet.addRows(data);
            worksheet.columns = header.map(columnHeader => {
                return { header: columnHeader, key: columnHeader, width: 20 };
            });
                   
            

            // Write the workbook to a file
            let file = await workbook.xlsx.writeBuffer();

            // Set response header and send the file
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); //'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename="arota.csv"');
            res.send(file);
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving data');
    }
});





//mongoDB 연결 후 Listening to port 8080 만들기
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Listening to port ${PORT}`);
    });
});



// app.listen(port, (err) => {
//     if (err) {
//         console.log(err);
//     } else { // 아래 몽구스 연결에 직접 url 주소를 쓰지 않고 process.env.mongoDB_URL 로 쓰는 이유는, 보안을 위해서이다.
//         mongoose.connect(process.env.mongodb_URL, { useNewUrlParser: true, useUnifiedTopology: true },
//             (err) => {
//                 if (err) {
//                     console.log(err);
//                 } else {
//                     console.log("Connected to server and MongoDB successfully. Input data now.");
//                 }
//             }
//         );
//     }
// });


