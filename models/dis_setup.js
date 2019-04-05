module.exports = (mongoose) => {
    const dis_Setup = mongoose.Schema({
        d_id: { type: String},
        rfid_module: { type: Boolean, required: true },
        ir_50: { type: Boolean, required: true },
        ir_10: { type: Boolean, required: true },
        slot_sensor: { type: Boolean, required: true },
        D_ir_l: { type: Boolean, required: true },
        D_ir_R: { type: Boolean, required: true },

        logged_at: { type: Date, default: Date.now }
    })
    return mongoose.model('Dispenser_setup', dis_Setup);
}






/*rfid module | fingerprint module
 * IR 50
 * IR 10
 * slot sensor
 * dropped IR sensor
 * dropped IR sensor
 *
 */
