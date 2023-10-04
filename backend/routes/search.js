app.get('/', (req, res) => {
    const searchTerm = req.query.name;
    Event.find({ name: { $regex: searchTerm, $options: 'i' } })
        .then(events => {
            res.json(events);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        });
});