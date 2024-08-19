import bcrypt from 'bcrypt';
import bodyParser from 'body-parser'; // Import body-parser for handling JSON requests
import cors from "cors";
import express from 'express'; // Import express
import mongoose from 'mongoose';
import User from "./models/user.js";

const app = express(); // Create an express application
const port = process.env.PORT || 3000; // Set the port

app.use(bodyParser.json()); // Use body-parser middleware to parse JSON bodies
app.use(cors());

const connect = async () => {
    try {
        await mongoose.connect('mongodb+srv://gopika:ySUTmCxaFsjj1rzt@cluster0.otxjq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
        console.log("Connected to DB");
        
    } catch (error) {
        console.log(error);
        
    }
}

// registration 
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        // Save the user to the database
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

//Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        res.json({ message: 'Login successful', userData:{
            name: user.name,
        } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Start the server
app.listen(port, () => {
    connect()
    console.log(`Server running on http://localhost:${port}`);
});
