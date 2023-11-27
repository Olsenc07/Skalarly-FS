import  Skalar  from '/Users/chaseolsen/skalarly-MVP/skalarly-fs/backend/models/skalar.js';
async function verifyEmail(req, res, next) {
    try {
        const checkEmail = req.body.email; // Or req.query.email, depending on how you're sending the email
        const search = await Skalar.findOne({ email: checkEmail });
        
        if (search) {
            console.log('email found', search);
            next(); // Email found, proceed to next middleware or route handler
        } else {
            console.log('email not found');
            res.status(404).json({ message: 'Email not found' });
        }
    } catch (err) {
        console.error('error', err);
        res.status(500).json({ message: 'Server error' });
    }
}
export default verifyEmail;
