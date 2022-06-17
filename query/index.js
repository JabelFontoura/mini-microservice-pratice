const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const port = 4002;
const app = express();

app.use(bodyParser.json());
app.use(cors());

const posts = {};

const handleEvent = (type, data) => {
    switch (type) {
        case 'PostCreated':
            posts[data.id] = { id: data.id, title: data.title, comments: [] };
            break;

        case 'CommentCreated':
            posts[data.postId].comments.push({ id: data.id, content: data.content, status: data.status });
            break;

        case 'CommentUpdated':
            const comment = posts[data.postId].comments.find(c => c.id === data.id);
            comment.content = data.content;
            comment.status = data.status;
            break;
    }
};

app.get('/posts', (req, res) => {
    res.send(posts);
});

app.post('/events', (req, res) => {
    const { type, data } = req.body;

    handleEvent(type, data);

    res.send({});
});

app.listen(port, async () => {
    console.log(`Query running on port ${port}.`);

    try {
        const res = await axios.get('http://event-bus-srv:4005/events');

        for (let event of res.data) {
            const { type, data } = event;

            console.log('Processing event', type);
            handleEvent(type, data);
        }
    } catch(error) {
        console.log(error.message);
    }
});