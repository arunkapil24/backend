module.exports = (mongoose) => {
  const schema = mongoose.Schema({
  message:{type:String},
  logged_at: { type: Date, default: Date.now }
})
    return mongoose.model('Error_msg', schema);
}
