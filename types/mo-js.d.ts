declare module 'mo-js' {
  export default class MoJS {
    static Shape: any;
    static Timeline: any;
    static Html: any;
    static Burst: any;
    static Tween: any;
    static CustomShape: any;
    static addShape: (name: string, shape: any) => void;
    static easing: {
      path: (path: string) => any;
      [key: string]: any;
    };
  }
}
