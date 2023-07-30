// Only Endpoints here
import express from 'express';
import { apis } from './apis.js';

const app = express();
// middleware
app.use(express.json())

// identify endpoint
app.post('/identify', async (req, res) => {
	try {
    const response = await apis.identify(req);
    console.log('response:', response);
		res.json(response);
	} catch (err) {
		console.log(err.message);
	}
});

// start server
app.listen(4000, () => {
	console.log('Server has started at port 4000');
});
