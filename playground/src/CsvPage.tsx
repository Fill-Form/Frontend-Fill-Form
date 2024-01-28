import React from 'react';
import { useLocation } from 'react-router-dom';

const CsvPage = () => {
  const location = useLocation();
  const csvData = location.state.csvData;
  const headers = csvData.length > 0 ? Object.keys(csvData[0]) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
{/* <div style={{ position: 'absolute', top: '30%' }}> */}
      <h1>Data Table</h1>
      <table>
        <thead>
          <tr>
            {headers.map((header, index) => (
              // <th key={index}>{header}</th>
              <th key={index} style={{ border: '1px solid black', padding: '10px' }}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.isArray(csvData) && csvData.map((row:any, rowIndex: number) => (
            <tr key={rowIndex}>
              {headers.map((header:string, index:number) => (
                // <td key={index}>{row[header]}</td>
                <td key={index} style={{ border: '1px solid black', padding: '10px' }}>{row[header]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
{/* </div> */}
    </div>
  );
};

export default CsvPage;
