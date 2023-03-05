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
        weight: data.weight,
        height: data.height,
        bsa: data.bsa,
        bmi: data.bmi,
        smoking: data.smoking,
        hb: data.hb,
        plt: data.plt,
        cr: data.cr,
        bun: data.bun,
        gfr: data.gfr,
        dm: data.dm,
        insulin: data.insulin,
        ckd: data.ckd,
        dialysis: data.dialysis,
        ht: data.ht,
        lung: data.lung,
        fev1: data.fev1,
        carotid: data.carotid,
        pvd: data.pvd,
        cerebrovasc: data.cerebrovasc,
        redo: data.redo,
        prev_aorta_op: data.prev_aorta_op,
        prev_mi: data.prev_mi,
        connective: data.connective,
        cpr: data.cpr,
        tamponade: data.tamponade,
        af: data.af,
        nyha: data.nyha,
        pre_echo: data.pre_echo,
        coronary: data.coronary,
        ef: data.ef,
        aortic_insufficiency: data.aortic_insufficiency,
        mitral_regurgitation: data.mitral_regurgitation,
        tricuspid_regurgitation: data.tricuspid_regurgitation,
        cause: data.cause,
        rupture: data.rupture,
        elective: data.elective,
        emergency: data.emergency,
        op_name: data.op_name,
        homograft: data.homograft,
        op_time: data.op_time,
        cpb_time: data.cpb_time,
        acc_time: data.acc_time,
        low_temp: data.low_temp,
        temp_measure: data.temp_measure,
        Low_body_ischemic_time: data.Low_body_ischemic_time,
        tca: data.tca,
        prox_acc_location: data.prox_acc_location,
        cannulation_site: data.cannulation_site,
        retro_cbr_pefusion: data.retro_cbr_pefusion,
        ante_cbr_perfusion_uni: data.ante_cbr_perfusion_uni,
        cbr_perfusion_bi: data.cbr_perfusion_bi,
        selective_visc_perfusion: data.selective_visc_perfusion,
        intercostal_reimplant: data.intercostal_reimplant,
        csf: data.csf,
        cabg: data.cabg,
        aortic_valve: data.aortic_valve,
        mitral_valve: data.mitral_valve,
        maze: data.maze,
        tricuspid: data.tricuspid,
        tevar: data.tevar,
        procedure_time: data.procedure_time,
        prox_lz: data.prox_lz,
        dist_lz: data.dist_lz,
        head_vss_revasc: data.head_vss_revasc,
        lsa_embo: data.lsa_embo,
        other_proc: data.other_proc,
        tevar_csf: data.tevar_csf,
        endoleak: data.endoleak,
        sine: data.sine,
        tevar_complication_others: data.tevar_complication_others,
        evar: data.evar,
        evar_pocedure_time: data.evar_pocedure_time,
        ibd: data.ibd,
        iia_embo: data.iia_embo,
        evar_other_proc: data.evar_other_proc,
        evar_endoleak: data.evar_endoleak,
        tevar_complication_others: data.tevar_complication_others,
        discharge_date: data.discharge_date,
        death: data.death,
        death_date: data.death_date,
        death_cause: data.death_cause,
        icu_stay: data.icu_stay,
        hospital_stay: data.hospital_stay,
        bleeding: data.bleeding,
        ami: data.ami,
        ecmo: data.ecmo,
        pul_cxr: data.pul_cxr,
        reintubation: data.reintubation,
        tracheostomy: data.tracheostomy,
        new_dialysis: data.new_dialysis,
        colitis: data.colitis,
        gi_bleeding: data.gi_bleeding,
        stroke: data.stroke,
        neuro_deficit: data.neuro_deficit,
        cbr_lesion: data.cbr_lesion,
        cord_injury: data.cord_injury,
        paraplegia: data.paraplegia,
        wound_infection: data.wound_infection,
        wound_site: data.wound_site
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
            head = aortadatas.filter(item => item.order_number
                === 1)[0]; //  order_number=1 인 elements 들 중 첫번째 것을 가져온다 (이 케이스에선 하나밖에 없음) 
            const fields = Object.keys(head._doc); //특별히 ._doc 을 붙이면 mongoose document 임을 의미
            
            

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
            //save the file to local system rather than displaying it in the browser window.
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


