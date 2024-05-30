// src/painterro.d.ts
declare module 'painterro' {
    interface PainterroOptions {
      defaultImage?: string;
      backplateImgUrl?: string
      shadowScale?: string
      hiddenTools?: string[],
      toolbarPosition?: string
      defaultSize?: string
      pixelizePixelSize?: string
      saveHandler?: any;
      onImageLoaded?:() => void;

      onSave?: (image: any, done: (ok: boolean) => void) => void;
      // Add other Painterro options here as needed
    }
  
    interface PainterroInstance {
      show: () => void;
      // Add other methods here as needed
    }
  
    function Painterro(options?: PainterroOptions): PainterroInstance;
  
    export default Painterro;
  }
  