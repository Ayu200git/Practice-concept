import { Router } from 'express';
import type { Todo } from '../models/todos';

type RequestBody = { text: String };
type RequestParams = { todoId: String ;}
 
let todos: Todo[] = [];

const router = Router();

router.get('/', (req, res, next) => {
    return res.status(200).json({ todos: todos });
});

router.post('/', (req, res, next) => {
    const body = req.body as RequestBody;
    const newTodo: Todo =  {
        id: new Date().toISOString(),
        text: req.body.text
    };
    todos.push(newTodo);

    return res.status(201).json({ message: 'Added todo', todo: newTodo, todos: todos});
});

router.put('/:todoId', (req, res, next) => {
    const params = req.params as RequestParams;
    const tid = req.params.todoId;
    const todoIndex = todos.findIndex(todoItem => todoItem.id === tid);
    if(todoIndex >= 0) {
       todos[todoIndex] = { id: todos[todoIndex].id , text: req.body.text};
       res.status(200).json({ message: 'updated todo', todos: todos});
    }
    return res.status(404).json({ message: 'not found'});
});

router.delete('/:todoId', (req, res, next) => {
    const params = req.params as RequestParams;
    todos = todos.filter(todoItem =>todoItem.id !== req.params.todoId );
    return res.status(200).json({ message: 'deleted todo', todos: todos});
})
export default router;