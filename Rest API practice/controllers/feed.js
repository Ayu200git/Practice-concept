exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [{ title: "ayush", content: "yes"}]
    });
};

exports.postPosts = (req, res, next) => {
    const title = req.body.title;
    const content = req. body.content;
    res.status(201).json({
        message: 'post data',
        post: { id: new Date().toString(), title: title,
            content: content,
        }
    });
};