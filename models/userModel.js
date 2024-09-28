const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        minlength: [3, 'Name must be at least 3 characters long'],
        maxlength: [30, 'Name must not exceed 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email']
    },
    photo: { 
        type: String, 
        default: 'default.jpg' 
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false
    },
    passwordConfirmation: {
        type: String,
        required: [true, 'Password confirmation is required'],
        validate: {
            validator: function (value) {
                return value === this.password;
            },
        message: 'Passwords are not the same'
        }
    },
    passwordChangedAt: { type: Date },
    passwordResetToken: String,
    passwordResetTokenExpiration: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

userSchema.pre("save", async function(next){
    // only run this function if password was actually modified
    if(!this.isModified('password')) return next();
    
    // hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    // delete the passwordConfirmation field as it's no longer needed
    this.passwordConfirmation = undefined;

    if (this.passwordChangedAt) {
        this.passwordChangedAt = new Date(this.passwordChangedAt);
      } else {
        // Set a default value if not provided
        this.passwordChangedAt = Date.now();
      }

    next();
});

userSchema.pre("save", function(next){
    if (!this.isModified("password") || this.isNew ) return next();
    this.passwordChangedAt = Date.now() - 1000// to make sure it's always in the past
    next();
});

userSchema.pre(/^find/, function(next){
    //this points to currnt qureey
    this.find({ active: {$ne: false} });
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changePasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return changedTimestamp > JWTTimestamp;
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest('hex');
    

    this.passwordResetTokenExpiration = Date.now() + 10 * 60 * 1000; // 10 minutes
    console.log({resetToken}, this.passwordResetToken);
    return resetToken;
};

const User = mongoose.model("User", userSchema);
 
module.exports = User;
