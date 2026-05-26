export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('No se pudo leer el contenido del archivo.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo. Intente de nuevo.'));
    };

    reader.readAsText(file);
  });
}
