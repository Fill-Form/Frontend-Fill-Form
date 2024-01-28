// import React from 'react';
// import { useLocation } from 'react-router-dom';

// const CsvPage = () => {
//   const location = useLocation();
//   const csvData = location.state.csvData;
//   const headers = csvData.length > 0 ? Object.keys(csvData[0]) : [];

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
// {/* <div style={{ position: 'absolute', top: '30%' }}> */}
//       <h1>Data Table</h1>
//       <table>
//         <thead>
//           <tr>
//             {headers.map((header, index) => (
//               // <th key={index}>{header}</th>
//               <th key={index} style={{ border: '1px solid black', padding: '10px' }}>{header}</th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {Array.isArray(csvData) && csvData.map((row:any, rowIndex: number) => (
//             <tr key={rowIndex}>
//               {headers.map((header:string, index:number) => (
//                 // <td key={index}>{row[header]}</td>
//                 <td key={index} style={{ border: '1px solid black', padding: '10px' }}>{row[header]}</td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
// {/* </div> */}
//     </div>
//   );
// };

// export default CsvPage;

import React, {useState, useEffect} from 'react';
import { useLocation } from 'react-router-dom';
import Papa from 'papaparse';

// import  './css/style.css';

const CsvPage = () => {
  const location = useLocation();
  const csvDataString = new URLSearchParams(location.search).get('data');


  // download csv file
  const [csvUrl, setCsvUrl] = useState<string | null>(null);
  useEffect(() => {
    if (csvDataString) {
      const csvData = new Blob([decodeURIComponent(csvDataString)], { type: 'text/csv' });
      const csvUrl = URL.createObjectURL(csvData);
      setCsvUrl(csvUrl);
    }
  }, [csvDataString]);

  const csvData = csvDataString ? Papa.parse(decodeURIComponent(csvDataString), { header: true }).data : [];
  const headers = csvData.length > 0 ? Object.keys(csvData[0] as object) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
      <h1>Data Table</h1>
      {csvUrl && <a href={csvUrl} download="data.csv">Download CSV</a>}
      <br />
      <table >
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index} style={{ backgroundColor: '#25c2a0', color: 'white',border: '1px solid black', padding: '10px' }}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.isArray(csvData) && csvData.map((row:any, rowIndex: number) => (
            <tr key={rowIndex}>
              {headers.map((header:string, index:number) => (
                <td key={index} style={{ border: '1px solid black', padding: '10px' }}>{row[header]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CsvPage;