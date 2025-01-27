import mongoose from 'mongoose';

var dlyProdnSchema = new mongoose.Schema({
    rpt_date:{type:String},
    blast_furnace:{
        unit_name:{type:String},
        ondtprodn:{type:Number},
        tilldateprodn:{type:Number},
        ondtcokerate:{type:Number},
        tilldatecokerate:{type:Number},
    },
    coke_oven:{
            unit_name:{
                type:String
            },
            ondtpushg:{
                type:Number
            },
            tilldatepushg:{
                type:Number
            },
            ondtimptinblend:{
                type:Number
            },
            tilldateimptinblend:{
                type:Number
            },
    }
});

module.exports = mongoose.model('DlyProdn',dlyProdnSchema)
