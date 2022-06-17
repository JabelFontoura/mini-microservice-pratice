const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const { randomBytes } = require('crypto');

const port = 4001;
const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res) => {
    res.send(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
    const id = randomBytes(4).toString('hex');
    const postId = req.params.id;
    const { content } = req.body;

    const comments = commentsByPostId[req.params.id] || [];
    comments.push({ id, content, status: 'pending' });

    commentsByPostId[req.params.id] = comments;

    await axios.post('http://event-bus-srv:4005/events', {
        type: 'CommentCreated',
        data: {
            id,
            content,
            postId,
            status: 'pending'
        }
    });

    res.status(201).send(comments);
});

app.post('/events', async (req, res) => {
    const { type, data } = req.body;
    console.log('Event received ' + type);
        console.log(type)
    if (type === 'CommentModerated') {
        const { postId, id, status, content } = data;

        const comments = commentsByPostId[postId];
        const comment = comments.find(c => c.id === id);
        comment.status = status;

        await axios.post('http://event-bus-srv:4005/events', {
            type: 'CommentUpdated',
            data: {
                id,
                postId,
                status,
                content
            }
        });
    }

    res.send({});
});

app.listen(port, () => {
    console.log(`Comments service running on port ${port}`);
});