import Exchange from '../models/Exchange.js';

export const getAllExchanges = async (req, res) => {
    try {
        const exchanges = await Exchange.find()
            .populate('requestor', 'username email')
            .populate('owner', 'username email')
            .populate('requestedBook')
            .populate('offeredBook')
            .sort({ createdAt: -1 });
        res.status(200).json(exchanges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getExchangeById = async (req, res) => {
    try {
        const exchange = await Exchange.findById(req.params.id)
            .populate('requestor', 'username email')
            .populate('owner', 'username email')
            .populate('requestedBook')
            .populate('offeredBook');
            
        if (!exchange) {
            return res.status(404).json({ message: 'Exchange not found' });
        }
        res.status(200).json(exchange);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createExchange = async (req, res) => {
    try {
        const newExchange = new Exchange({
            ...req.body,
            requestor: req.user.id,
            status: 'pending'
        });
        const savedExchange = await newExchange.save();
        
        const populatedExchange = await Exchange.findById(savedExchange._id)
            .populate('requestor', 'username email')
            .populate('owner', 'username email')
            .populate('requestedBook')
            .populate('offeredBook');
            
        res.status(201).json(populatedExchange);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateExchangeStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const exchange = await Exchange.findById(req.params.id);
        
        if (!exchange) {
            return res.status(404).json({ message: 'Exchange not found' });
        }

        // Check if user is the owner of the requested book
        if (exchange.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this exchange' });
        }

        if (!['accepted', 'rejected', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        exchange.status = status;
        exchange.updatedAt = Date.now();
        
        const updatedExchange = await exchange.save();
        const populatedExchange = await Exchange.findById(updatedExchange._id)
            .populate('requestor', 'username email')
            .populate('owner', 'username email')
            .populate('requestedBook')
            .populate('offeredBook');
            
        res.status(200).json(populatedExchange);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteExchange = async (req, res) => {
    try {
        const exchange = await Exchange.findById(req.params.id);
        if (!exchange) {
            return res.status(404).json({ message: 'Exchange not found' });
        }

        // Check if user is either the requestor or owner
        if (![exchange.requestor.toString(), exchange.owner.toString()].includes(req.user.id)) {
            return res.status(403).json({ message: 'Not authorized to delete this exchange' });
        }

        await exchange.remove();
        res.status(200).json({ message: 'Exchange deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};