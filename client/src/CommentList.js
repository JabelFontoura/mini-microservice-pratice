import React from 'react';

export default ({ comments }) => {
    const redenredComments = comments.map(comment => {
        let content;

        if (comment.status === 'approved') {
            content = comment.content;
        } else if (comment.status === 'pending') {
            content = 'This comment is awaiting for moderation';
        } else if (comment.status === 'rejected') {
            content = 'This comment has been rejected';
        }

        return <li key={comment.id}>{content}</li>;
    });

    return <div>
        {redenredComments}
    </div>;
};