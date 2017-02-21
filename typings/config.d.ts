/*
  Custom type def for config options
*/
declare module "config" {
  var config: {
    production: boolean;
    firebase: {
      apiKey: string;
      authDomain: string;
      databaseURL: string;
      storageBucket: string;
      messagingSenderId?: string;
    }
  };
  export = config;
}
