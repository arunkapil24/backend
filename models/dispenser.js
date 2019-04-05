module.exports = (mongoose) => {
    const schema = mongoose.Schema({
        d_id: { type: String, required: true },
        total_napkin: { type: Number },
        remaining_napkin: { type: Number },
        admin_phone_no:{type:String,required:true},
        created_at: { type: Date, default: Date.now }
    })
    return mongoose.model('Dispenser', schema);
}


// d_id:1,
// status:{
//     total_napkin:50,
//     remaining_napkin:50,
//     alert:false
// }
