import { useRef, useState } from 'react';
import { Template, checkTemplate, Lang } from '@pdfme/common';
import { Designer } from '@pdfme/ui';
import {
  getFontsData,
  getTemplate,
  readFile,
  cloneDeep,
  getPlugins,
  handleLoadTemplate,
  generatePDF,
  downloadJsonFile,
  readMultipleFiles,
  // downloadCsvFile
  downloadCsvFileFromBlob
} from './helper';

import './css/button.css'; // Add the missing import statement for the CSS file.
import axios from 'axios';

const headerHeight = 65;

function App() {
  const designerRef = useRef<HTMLDivElement | null>(null);
  const designer = useRef<Designer | null>(null);
  const [lang, setLang] = useState<Lang>('en');
  const [prevDesignerRef, setPrevDesignerRef] = useState<Designer | null>(null);

  const buildDesigner = () => {
    let template: Template = getTemplate();
    try {
      const templateString = localStorage.getItem('template');
      const templateJson = templateString ? JSON.parse(templateString) : getTemplate();
      checkTemplate(templateJson);
      template = templateJson as Template;
    } catch {
      localStorage.removeItem('template');
    }

    getFontsData().then((font) => {
      if (designerRef.current) {
        designer.current = new Designer({
          domContainer: designerRef.current,
          template,
          options: {
            font,
            lang,
            labels: {
              addNewField: 'ADD NEW FIELD!', // Update existing labels
              clear: '🗑️', // Add custom labels to consume them in your own plugins
            },
            theme: {
              token: {
                colorPrimary: '#25c2a0',
              },
            },
          },
          plugins: getPlugins(),
        });
        designer.current.onSaveTemplate(onSaveTemplate);
      }
    });
  };

  const onChangeBasePDF = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target && e.target.files) {
      readFile(e.target.files[0], 'dataURL').then(async (basePdf) => {
        if (designer.current) {
          designer.current.updateTemplate(
            Object.assign(cloneDeep(designer.current.getTemplate()), {
              basePdf,
            })
          );
        }
      });
    }
  };

  const onChangeMultiplePDFs = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target && e.target.files) {
      readMultipleFiles(e.target.files).then((basePdfs) => {
      // Convert array of base64 strings to JSON
      const basePdfsJson = JSON.stringify(basePdfs);
      const schemas = designer.current?.getTemplate().schemas;
      const schemasJson = JSON.stringify(schemas);
      const dataToSend = {
        pdfs : basePdfsJson,
        schemas : schemasJson,
      }
      console.log(dataToSend)
      axios
        .post("http://localhost:8000/api/v1/general/get-csv/", dataToSend)
        .then((response) => {
          // console.log(response);
          // setMessage(response.data);
          // const csvData = new Blob([response.data], { type: 'text/csv' });
          // const csvDataUrl = URL.createObjectURL(csvData);
          // downloadCsvFile(csvDataUrl, 'downloadedFile');
          const csvData = new Blob([response.data], { type: 'text/csv' });
          downloadCsvFileFromBlob(csvData, 'downloadedFile');
        })
        .catch(error => {
          console.log(error)
        })
        // console.log(dataToSend)
        })
    }
  };

    // fetch('', {
    //   method: 'POST',
    //     headers:{
    //     'Content-Type': 'application/json',
    //   },
    //     body: JSON.stringify(dataToSend),
    //   })
    //   .then(respone => respone.json())
    //   .then(data => console.log(data))
    //   .catch(error => console.log(error));
	// useEffect(() => {
	// 	axios
	// 		.get("http://localhost:8000/general/api/v1/hello-world/")
	// 		.then((response) => {
	// 			console.log(response);
	// 			setMessage(response.data);
	// 		})
	// 		.catch((error) => {
	// 			console.log(error);
	// 		});
	// }, []);


  const onViewResult = () => {

  }



  const onDownloadTemplate = () => {
    if (designer.current) {
      // console.log(designer.current.getTemplate())
      // console.log(designer.current.getTemplate().schemas)
      downloadJsonFile(designer.current.getTemplate(), 'template');
      console.log(designer.current.getTemplate());
    }
  };

  // const onDownloadCsv = () => {

  // }

  const onSaveTemplate = (template?: Template) => {
    if (designer.current) {
      localStorage.setItem('template', JSON.stringify(template || designer.current.getTemplate()));
      alert('Saved!');
    }
  };

  const onResetTemplate = () => {
    if (designer.current) {
      designer.current.updateTemplate(getTemplate());
      localStorage.removeItem('template');
    }
  };

  if (designerRef != prevDesignerRef) {
    if (prevDesignerRef && designer.current) {
      designer.current.destroy();
    }
    buildDesigner();
    setPrevDesignerRef(designerRef);
  }

  return (
    <div>
      <header
        style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '10px 0',
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #ddd'
      }}
      >
        {/* <strong>Designer</strong> */}

        {/* <span style={{ margin: '0 1rem' }}>:</span>
        <select
          onChange={(e) => {
            setLang(e.target.value as Lang);
            if (designer.current) {
              designer.current.updateOptions({ lang: e.target.value as Lang });
            }
          }}
          value={lang}
        >
          <option value="en">English</option>
          <option value="ja">Japanese</option>
          <option value="ar">Arabic</option>
          <option value="th">Thai</option>
          <option value="pl">Polish</option>
          <option value="it">Italian</option>
          <option value="de">German</option>
        </select> */}

        {/* PDF INPUT */}
        <button className="button-16" role="button" onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'application/pdf';
          input.addEventListener('change', (e: unknown) => {
            onChangeBasePDF(e as React.ChangeEvent<HTMLInputElement>)
          })
          input.click();
        }}>
          Upload PDF
        </button>

        {/* backup */}
        {/* <span style={{ margin: '0 1rem' }}></span>
        <label style={{ width: 180 }}>
          Change BasePDF
          <input type="file" accept="application/pdf" onChange={onChangeBasePDF} />
          {/* <input type="file" multiple accept="application/pdf"  /> */}
        {/* </label> */} 

        {/* <span style={{ margin: '0 1rem' }}>/</span> */}
        <button className="button-16" role="button" onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'application/json';
          input.addEventListener('change', (e: unknown) => handleLoadTemplate(e as React.ChangeEvent<HTMLInputElement>, designer.current));
          input.click();
        }}>
          Load Template
        </button>

        {/* backup */}
        {/* <label style={{ width: 180 }}>
          Load Template
          <input
            type="file"
            accept="application/json"
            onChange={(e) => handleLoadTemplate(e, designer.current)}
          />
        </label> */}

        {/* Download Template */}
        {/* <span style={{ margin: '0 1rem' }}>/</span> */}
        <button className="button-16" role="button" onClick={onDownloadTemplate}>Download Template</button>

        {/* Same Template */}
        {/* <span style={{ margin: '0 1rem' }}>/</span> */}
        <button className="button-16" role="button" onClick={() => onSaveTemplate()}>Save Template</button>

        {/* Reset Template */}
        {/* <span style={{ margin: '0 1rem' }}>/</span> */}
        <button className="button-16" role="button" onClick={onResetTemplate}>Reset Template</button>

        {/* Generate CSV
        <span style={{ margin: '0 1rem' }}>/</span>
        <button onClick={() => generatePDF(designer.current)}>Generate CSV</button> */}

        {/* Upload Multiple PDFs */}
        <button className="button-16" role="button" onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'application/pdf';
          input.multiple = true;
          input.addEventListener('change', (e: unknown) => onChangeMultiplePDFs(e as React.ChangeEvent<HTMLInputElement>));
          input.click();
        }}>
          Upload Multiple PDFs
        </button>

        <button className="button-16" role="button" onClick={() => {
        }}> View Result
        </button>
      </header>
      <div ref={designerRef} style={{ width: '100%', height: `calc(100vh - ${headerHeight}px)` }} />
    </div>
  );
}

export default App;
