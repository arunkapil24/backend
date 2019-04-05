module.exports = (mongoose) => {
    const user_schema = mongoose.Schema({
        rfid: { type: String, required: true },
        user_id: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        daily: { type: Number, default: 0 },
        monthly: { type: Number, default: 0 },
        created_at: { type: Date, default: Date.now }
    })
    return mongoose.model('User', user_schema);
}