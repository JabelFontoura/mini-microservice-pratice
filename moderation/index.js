const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const port = 4003;
const app = express();
app.use(bodyParser.json());

app.post('/events', async (req, res) => {
    const { type, data } = req.body;
    const { id, postId, content } = data;

    if (type === 'CommentCreated') {
        const status = data.content.includes('orange') ? 'rejected' : 'approved';

        await axios.post('http://event-bus-srv:4005/events', {
            type: 'CommentModerated',
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
    console.log(`Moderation running on port: ${port}`);
})