import { useEffect, useState } from 'react';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import moment from 'moment';
import exceljs from 'exceljs';
import XLSX from 'xlsx';
const csvParser = require('csv-parser');
const storage = multer.diskStorage({
  destination: 'public/upload/lfp',
  filename: function (req, file, cb) {
    const randomNum = Math.floor(Math.random() * (999 - 100 + 1) + 100);
    const timestamp = moment().format('YYYY_MM_DD-HHmmss');
    const extname = path.extname(file.originalname);
    const fileName = `${timestamp}_${randomNum}${extname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await new Promise((resolve, reject) => {
        upload.single('file')(req, res, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      if (!req.file) {
        throw new Error('No file uploaded.');
      }
      const fileType = req.file.mimetype;
      const fileExtension = req.file.originalname.split('.').pop();

      if (fileType === 'text/csv' || fileExtension === 'csv') {
        const { filename } = req.file;
        const filePath = path.join('public/upload/lfp', filename);
        console.log(`Reading file from path: ${filePath}`);
        const responseData = [];
        let errorShow = [];
        let errorData = [];
        errorShow = [
          {
            no: '',
            symptom: '',
            remedy: '',
            part: '',
          },
        ];
        errorData = [
          {
            no: '',
            symptom: '',
            remedy: '',
            part: '',
          },
        ];
        fs.createReadStream(filePath)
        .pipe(csvParser({ headers: true, trim: true }))
        .on('data', (row) => {
          console.log(row)
            try {
              if(row._1.trim()!="Current Value" && row._1.trim()!="Number of Agreed Times" && row._1.trim()!=""){
                const addRow = {
                  Items: row._0 ? row._0.trim() : '',                          // Mapping column 1 to 'Items'
                  CurrentValue: typeof row._1 === 'string' ? row._1.trim() : row._1,  // Mapping column 2 to 'CurrentValue'
                  Limit: row._2 ? row._2.trim() : '',                        // Mapping column 3 to 'Remedy'
                  Situation: row._3 ? row._3.trim() : '',                         // Mapping column 4 to 'Limit'
                  Remedy: row._4 ? row._4.trim() : ''                      // Mapping column 5 to 'Situation'
                };
                responseData.push(addRow);
              }
              
            } catch (error) {
                errorData.push(row);
                errorShow.push(`Error processing row: ${JSON.stringify(row)} - ${error.message}`);
            }
        })
        .on('end', () => {
            const returnResult = {
                uploadedFileName: filename,
                worksheetData: responseData,
                errorData: errorData,
                errorShow: errorShow
            };
            console.log('returnResult',returnResult);
            res.status(200).json(returnResult);
        })
        .on('error', (err) => {
            res.status(500).json({ error: 'Failed to parse CSV', details: err.message });
        });
      }else{
        const selectedModel = req.body.selectedModel;
        console.log('selectedModel',selectedModel);
        const { filename } = req.file;
        const filePath = path.join('public/upload/lfp', filename);
        console.log('filePath',filePath);
        console.log('filename',filename);
        let jsonData = [] ;
        let worksheetError = [];
        let worksheetData = [];
        try {
          fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return;
            }
            const workbook = XLSX.read(data, { type: 'buffer' });

            console.log("Workbook Sheets:", workbook.SheetNames); // Log available sheets

            // List of possible sheet names
            const possibleSheetNames = ["Error History", "Errors History"];

            // Find which sheet exists in the workbook
            const sheetNameFound = possibleSheetNames.find(sheet => workbook.Sheets[sheet]);

            if (sheetNameFound) {
                console.log(`✅ Sheet '${sheetNameFound}' found.`);
                const sheetError = workbook.Sheets[sheetNameFound];
                worksheetError = XLSX.utils.sheet_to_json(sheetError);
            } else {
                console.warn("⚠️ Warning: Neither 'Error History' nor 'Errors History' found in the Excel file.");
                worksheetError = []; // Set to empty array to prevent errors
            }
            console.log('worksheetError',worksheetError);
            
            // 🔹 Check if at least one sheet exists
            if (workbook.SheetNames.length > 0) {
                const sheetName = workbook.SheetNames[0];
                console.log(`Processing first sheet: ${sheetName}`);
                
                if (workbook.Sheets[sheetName]) {
                    const sheet = workbook.Sheets[sheetName];
                    worksheetData = XLSX.utils.sheet_to_json(sheet);
                } else {
                    console.warn(`⚠️ Warning: Sheet '${sheetName}' is missing.`);
                    worksheetData = []; // Prevent crashes
                }
            } else {
                console.error("❌ Error: No sheets found in the Excel file.");
                worksheetData = [];
            }


            let type = "";
            let errorContent = "";
            let timeStamp = "";
            let foundServiceCall = false;
            let nextRecord;

            for (let i = 0; i < worksheetError.length; i++) {
              const record = worksheetError[i];
              
              if (foundServiceCall) {
                nextRecord = record;
                type = record.Type;
                errorContent = record['Error Content'];
                timeStamp = record['Time Stamp'];
                break;
              }
              
              if (record.Type === '<Service Calls Errors History>') {
                foundServiceCall = true;
              }
            }
            let countErrorShow = 1;
            let errorShow = [];
            let errorData = [];
            if(type){
              errorShow = [
                {
                  no: 1,
                  symptom: type,
                  remedy: errorContent,
                  part: timeStamp,
                },
              ];
              errorData = [
                {
                  no: 1,
                  symptom: type,
                  remedy: errorContent,
                  part: timeStamp,
                },
              ];
              countErrorShow+=1;
            }
            //end find error
            let responseData = [];
            console.log('worksheetData->',worksheetData);
            worksheetData.forEach(row => {
              const { Items, 'Current value': remedy } = row;
              const SituationValue = row['Situation'] || row['Situation %'] || '';
              const Limit = row['Limit'] || row['Reference Limit'] || '';
              if(row['Current value'] || row['Current Value']){
                const addrow = {
                  Items: row.Items ? row.Items.trim() : '',
                  CurrentValue: row['Current Value']
                    ? typeof row['Current Value'] === 'string'
                        ? row['Current Value'].trim()
                        : row['Current Value']
                    : row['Current value']
                        ? typeof row['Current value'] === 'string'
                            ? row['Current value'].trim()
                            : row['Current value']
                        : '',
                  Remedy: row.remedy ? row.remedy.trim() : '',
                  Limit: Limit ? Limit.trim() : '',
                  Situation: SituationValue ? SituationValue.trim() : ''
                }
                console.log('addrow' , addrow);
                const numericCurrentValue = parseFloat(addrow.CurrentValue) || 0;

                // 🔹 Function to check if a value is a DateTime
                const isDateTime = (value) => {
                    return !isNaN(Date.parse(value)); // Returns true if the value can be parsed as a Date
                };

                // 🔹 Only push if CurrentValue is NOT a DateTime and greater than or equal to 0
                if (numericCurrentValue >= 0 && !isDateTime(addrow.CurrentValue)) {
                    responseData.push(addrow);
                } else {
                    console.warn(`Skipping row with invalid CurrentValue: ${addrow.CurrentValue}`);
                }

                
                let numericRemedy = '';
                let numericThreshold = '';
                if (remedy) {
                  numericRemedy = parseInt(remedy.toString().replace(/,/g, ''), 10);
                }
                
                if (Limit) {
                    numericThreshold = parseInt(Limit.toString().replace(/,/g, ''), 10);
                }
                let countPumpCounter = 0;
    
                if (Items.includes('Pump Counter')) {
                  countPumpCounter += 1;
                }
                
                if (Items.includes('Pump Cap Unit (Full)') && (numericRemedy >= numericThreshold)) {
                  errorShow.push({
                    no: countErrorShow,
                    symptom: Items,
                    remedy: remedy.toString().split(' ')[0],
                    part: 'ปั้มซ้าย'
                  });
                  countErrorShow += 1;
                }
                if (Items.includes('Total Print Dimension') && (numericRemedy >= numericThreshold)) {
                  errorShow.push({
                    no: countErrorShow ,
                    symptom: Items,
                    remedy: remedy.toString().split(' ')[0], 
                    part: 'เปลี่ยนหัวพิมพ์'
                  });
                  countErrorShow+=1;
                }
                if (Items.includes('CR passes') && (numericRemedy >= numericThreshold)) {
                  errorShow.push({
                    no: countErrorShow ,
                    symptom: Items,
                    remedy: remedy.toString().split(' ')[0], 
                    part: 'เปลี่ยน cr moter'
                  });
                  countErrorShow+=1;
                }
                if (Items.includes('Ink Tube(Pass)') && (numericRemedy >= numericThreshold)) {
                  errorShow.push({
                    no: countErrorShow ,
                    symptom: Items,
                    remedy: remedy.toString().split(' ')[0], 
                    part: 'ท่อหมึก'
                  });
                  countErrorShow+=1;
                }
                if (Items.includes('Buffer Counter') && (numericRemedy >= numericThreshold)) {
                  errorShow.push({
                    no: countErrorShow ,
                    symptom: Items,
                    remedy: remedy.toString().split(' ')[0],
                    part: 'เปลี่ยน duct'
                  });
                  countErrorShow+=1;
                }
                if (Items.includes('Pump Counter') && (numericRemedy >= numericThreshold) && countPumpCounter==1) {
                  errorShow.push({
                    no: countErrorShow ,
                    symptom: Items,
                    remedy: remedy.toString().split(' ')[0],
                    part: 'ink holder ขวา'
                  });
                  countErrorShow+=1;
                }
                if (Items.includes('Pump Counter') && (numericRemedy >= numericThreshold) && countPumpCounter==2) {
                  errorShow.push({
                    no: countErrorShow ,
                    symptom: Items,
                    remedy: remedy.toString().split(' ')[0],
                    part: 'ink holder ซ้าย'
                  });
                  countErrorShow+=1;
                }
                if (Items.includes('Pump Cap Unit (Home)') && (numericRemedy >= numericThreshold)) {
                  errorShow.push({
                    no: countErrorShow ,
                    symptom: Items,
                    remedy: remedy.toString().split(' ')[0], 
                    part: 'ปั้ม ขวา'
                  });
                  countErrorShow+=1;
                }
                if (Items.includes('Pump Cap Unit (Full)') && (numericRemedy >= numericThreshold)) {
                  errorShow.push({
                    no: countErrorShow ,
                    symptom: Items,
                    remedy: remedy.toString().split(' ')[0], 
                    part: 'ปั้มซ้าย'
                  });
                  countErrorShow+=1;
                }
              }
            });
            
            const returnResult = 
              { 
                uploadedFileName: filename, 
                worksheetData: responseData, 
                errorData:errorData,
                errorShow:errorShow  
              };
            console.log('returnResult',returnResult);
            res.status(200).json(returnResult);
          });
        } catch (error) {
            console.error("Error reading file:", error);
            return;
        }
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error reading the file.' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
