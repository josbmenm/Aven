import App from './App';
import WebServer from '../infra/WebServer';

var Airtable = require('airtable');
// var base = new Airtable({apiKey: 'YOUR_API_KEY'}).base('app0LDIj57JINdgFU');

const runServer = () => WebServer(App);

export default runServer;
