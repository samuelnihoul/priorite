import stripe from 'stripe'

export async function POST(  (req, res) => {
    const { userId, credits } = req.body;
    // Update user credits in the database
    await User.findByIdAndUpdate(userId, { $inc: { credits: credits } });
    res.send({ success: true });
});