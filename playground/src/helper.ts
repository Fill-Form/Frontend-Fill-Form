import { Template, Font, checkTemplate, getInputFromTemplate, BLANK_PDF } from '@pdfme/common';
import { Form, Viewer, Designer } from '@pdfme/ui';
import { generate } from '@pdfme/generator';
import {
  // text,
  // readOnlyText,
  // barcodes,
  // image,
  // readOnlyImage,
  // svg,
  // readOnlySvg,
  // line,
  rectangle,
  // ellipse,
} from '@pdfme/schemas';
import plugins from './plugins';

const fontObjList = [
  {
    fallback: true,
    label: 'NotoSerifJP-Regular',
    url: '/fonts/NotoSerifJP-Regular.otf',
  },
  {
    fallback: false,
    label: 'NotoSansJP-Regular',
    url: '/fonts/NotoSansJP-Regular.otf',
  },
];

export const getFontsData = async () => {
  const fontDataList = await Promise.all(
    fontObjList.map(async (font) => ({
      ...font,
      data: await fetch(font.url).then((res) => res.arrayBuffer()),
    }))
  );

  return fontDataList.reduce((acc, font) => ({ ...acc, [font.label]: font }), {} as Font);
};

export const readFile = (file: File | null, type: 'text' | 'dataURL' | 'arrayBuffer') => {
  return new Promise<string | ArrayBuffer>((r) => {
    const fileReader = new FileReader();
    fileReader.addEventListener('load', (e) => {
      if (e && e.target && e.target.result && file !== null) {
        r(e.target.result);
      }
    });
    if (file !== null) {
      if (type === 'text') {
        fileReader.readAsText(file);
      } else if (type === 'dataURL') {
        fileReader.readAsDataURL(file);
      } else if (type === 'arrayBuffer') {
        fileReader.readAsArrayBuffer(file);
      }
    }
  });
};

export const readMultipleFiles = (files: FileList | null) => {
  const promises = Array.from(files || []).map((file) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('File could not be read'));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    })
  );
  return Promise.all(promises);
};



export const cloneDeep = (obj: any) => JSON.parse(JSON.stringify(obj));

const getTemplateFromJsonFile = (file: File) => {
  return readFile(file, 'text').then((jsonStr) => {
    const template: Template = JSON.parse(jsonStr as string);
    try {
      checkTemplate(template);
      return template;
    } catch (e) {
      throw e;
    }
  });
};

export const downloadJsonFile = (json: any, title: string) => {
  if (typeof window !== 'undefined') {
    // console.log(json)
    const blob = new Blob([JSON.stringify(json)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
};


// export const downloadCsvFile = (csv: string, title: string) => {
//   if (typeof window !== 'undefined') {
//     const blob = new Blob([csv], {
//       type: 'text/csv',
//     });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `${title}.csv`;
//     link.click();
//     URL.revokeObjectURL(url);
//   }
// };
export const downloadCsvFileFromBlob = (blob: Blob, title: string) => {
  if (typeof window !== 'undefined') {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
};
export const handleLoadTemplate = (
  e: React.ChangeEvent<HTMLInputElement>,
  currentRef: Designer | Form | Viewer | null
) => {
  if (e.target && e.target.files) {
    getTemplateFromJsonFile(e.target.files[0])
      .then((t) => {
        if (!currentRef) return;
        currentRef.updateTemplate(t);
      })
      .catch((e) => {
        alert(`Invalid template file.
--------------------------
${e}`);
      });
  }
};

export const getPlugins = () => {
  return {
    Rectangle: rectangle,
  };
};

export const generatePDF = async (currentRef: Designer | Form | Viewer | null) => {
  if (!currentRef) return;
  const template = currentRef.getTemplate();
  const inputs =
    typeof (currentRef as Viewer | Form).getInputs === 'function'
      ? (currentRef as Viewer | Form).getInputs()
      : getInputFromTemplate(template);
  const font = await getFontsData();

  const pdf = await generate({
    template,
    inputs,
    options: { font, title: 'pdfme' },
    plugins: getPlugins(),
  });

  const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
  window.open(URL.createObjectURL(blob));
};

export const isJsonString = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

export const getTemplate = (): Template => ({
  schemas: [
  ],
  basePdf: BLANK_PDF
});
