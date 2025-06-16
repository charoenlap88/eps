import { connectDb } from '../../../utils/db';
import multer from 'multer';
import fs from 'fs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { model, filename } = req.body;

  const filePath = 'public/upload/projector/' + filename;
  const fileBuffer = fs.readFileSync(filePath);

  const iconv = require('iconv-lite');
  let fileContent;
  const logData = [];
  const errorData = [];
  const informationData = [];
  const connection = await connectDb();
  try {

    const [result_query] = await connection.query(
      'SELECT * FROM es_pt_log WHERE model = ? ORDER BY error_code_postfix DESC',
      [model]
    );
    if (result_query.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (fileBuffer[0] === 0xFF && fileBuffer[1] === 0xFE) {
      fileContent = iconv.decode(fileBuffer, 'utf16le');
    } else {
      fileContent = fileBuffer.toString('utf-8');
    }
    const lines = fileContent.split('\n');
    let break_loop = false;
    let no = 0;

    let total_op = '';
    let lamp_on = 0;
    let lamp_off = 0;
    // find lamp 
    let check_time = 1;
    let check_on = 1;
    let check_off = 1;
    for (let i = 0; i < lines.length - 1; i++) {
      const currentLine = lines[i];
      
      if((currentLine.includes("LampInformation") && currentLine.includes("Total Op.Time") ) || (currentLine.includes('"Total Op.Time()"') || (currentLine.includes('"Lamp Op. Time(C)"')) )){
        const parts = currentLine.split("\t");
        if (parts.length >= 3) {
          if(check_time===1){
            total_op = parts[2].replace(/"/g, "").trim();
            check_time = 0;
          }
        }
      }
      if((currentLine.includes("LampInformation") && currentLine.includes("Lamp ON Counter"))||currentLine.includes('"Lamp ON Counter"')){
        const parts = currentLine.split("\t");
        if (parts.length >= 3) {
          if(check_on===1){
            lamp_on = parts[2].replace(/"/g, "").trim();
            check_on = 0;
          }
        }
      }
      if((currentLine.includes("LampInformation") && currentLine.includes("Lamp OFF Counter"))||currentLine.includes('"Lamp OFF Counter"')){
        const parts = currentLine.split("\t");
        if (parts.length >= 3) {
          if(check_off===1){
            lamp_off = parts[2].replace(/"/g, "").trim();
            check_off = 0;
          }
        }
      }
    }
    if(total_op.length){
      informationData.push({key:0,item:'Total Operation Time',currentValue:total_op});
      informationData.push({key:1,item:'Lamp ON Counter',currentValue:lamp_on});
      informationData.push({key:2,item:'Lamp OFF Counter',currentValue:lamp_off});
    }
    // find error
    for (let i = 0; i < lines.length - 1; i++) {
      const previousLine = lines[i -1];
      const currentLine = lines[i];
      const nextLine = lines[i + 1];
      const nextLine2 = lines[i + 2];
      const nextLine3 = lines[i + 3];
      let listErrorDetect = "";
      const searchText = "ERR";
      const searchText2 = "Error Log1 (Latest)";
      if (currentLine.includes(searchText) || currentLine.includes(searchText2)) {
        listErrorDetect = currentLine;
      }
      if(listErrorDetect!=''){
        for (const error of result_query) {
          let strconcat = currentLine + ' ' + nextLine + ' ' + nextLine2;

          const prefixMatch = strconcat.includes(error.error_code_prefix);
          const postfixMatchCurrent = strconcat.includes(error.error_code_postfix);
          // const postfixMatchNext = nextLine.includes(error.error_code_postfix);
          const postfixMatch = error.error_code_postfix === '' || nextLine.includes(error.error_code_postfix);
          // logData.push({
          //   prefixMatch: prefixMatch,
          //   postfixMatch: postfixMatch,
          //   currentLine:currentLine,
          //   postfixMatchNext:postfixMatchNext
          // });
          if ((prefixMatch && postfixMatch) || (prefixMatch && postfixMatchCurrent)) {
            const searchText = "[ERR]";
            const searchText2 = "Error Log1 (Latest)";
            const searchText3 = "[WAR]";
            // logData.push({
            //   currentLine: currentLine,
            //   previousLine: previousLine,
            //   nextLine:nextLine,
            //   nextLine2:nextLine2,
            //   nextLine3:nextLine3,
            //   error_code_prefix: error.error_code_prefix
            // });
            if (currentLine.includes(searchText) || currentLine.includes(searchText2) || currentLine.includes(searchText3)) {
              no += 1;
              const pattern = /T (\d+h\d+m\d+s)/;
              const pattern2 = /\t"(\d{4}h \d{2}m \d{2}s)"/;
              const match = previousLine.match(pattern);
              console.log(match);
              let timeString = '';
              if (match) {
                timeString = match[1];
              }
              const match1 = nextLine.match(pattern);
              if (match1) {
                timeString = match[1];
              }
              const match2 = nextLine2.match(pattern);
              if (match2) {
                timeString = match[1];
              }
              const match3 = nextLine3.match(pattern2);
              if (match3 && match3[1]) {
                timeString = match3[1];
              }
              // logData.push({
              //   prefixMatch: prefixMatch,
              //   postfixMatch: postfixMatch,
              //   currentLine:currentLine,
              //   postfixMatchNext:postfixMatchNext,
              //   timeString:timeString
              // });
              
              errorData.push({
                key: no,
                no: timeString,
                symptom: error.behavior,
                remedy: error.part,
                part: error.part_code,
              });
              break_loop = true;
              break;
            }
          }
        }
        if(break_loop){
          break;
        }
      }
    }
    
    console.log(logData);
    res.status(200).json({ uploadedFileName: filename, errorData: errorData, information: informationData });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }finally {
    //  ; 
  }

}
