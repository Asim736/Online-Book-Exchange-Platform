import mongoose from 'mongoose';

const exchangeSchema = new mongoose.Schema({
    requestor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requestedBook: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    offeredBook: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Exchange = mongoose.model('Exchange', exchangeSchema);

export default Exchange;