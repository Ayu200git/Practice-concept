import express from 'express' ;

import bodyParser from 'body-parser';
import todosRoutes from './routes/todos';

const app = express();

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use('/todos', todosRoutes);

app.listen(3000);