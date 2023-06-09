const User = require('../models/user.model')
const catchAsync = require('../utils/catchAsync')
const generateJWT = require('../utils/jwt')
const bcrypt = require('bcryptjs')


exports.findUsers = catchAsync(async(req, res) => {
  
  const users = await User.findAll({
      where: {
        status: 'available'
      }
    })
  
    return res.json({
      message: 'Users found',
      results: users.length,
      users
    })
})

exports.createUser = catchAsync(async(req, res) => {
  try {
    const {name, email, password, role} = req.body

    const salt = await bcrypt.genSalt(12);
    const encryptedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.toLowerCase(),
      email: email.toLowerCase(),
      password: encryptedPassword,
      role
    })

    res.status(201).json({
      message: 'User has been created!',
      user
    })
    
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'fail',
      message: 'Something went very wrong',
    });
  }
})

exports.findAUser = catchAsync(async(req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      where: {
        id,
        status: 'available'
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: `The user with id: ${id} doesn't exist`,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'User found',
      user
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'fail',
      message: 'Something went very wrong!',
    });
  }
})

exports.updateUser = catchAsync(async(req, res) => { 
  try {
    const {id} = req.params
    const { name, email } = req.body

    const user = await User.findOne({
      where: {
        id,
        status: 'available',
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: `User with id: ${id} doesn't exist`,
      });
    }

    await user.update({name, email})

    res.status(200).json({
      status: 'success',
      message: 'User has been updated',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'fail',
      message: 'Something went very wrong!',
    });
  }
})

exports.deleteUser = catchAsync(async(req, res) => {
  try {
    const { id } = req.params
    
    const user = await User.findOne({
      where: {
        id,
        status: "available"
      }
    })
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: `User with id: ${id} doesn't exist!`
      })
    }
    
    await user.update({ status: "unavailable" })

    return res.status(200).json({
      status: 'success',
      message: `User's account disabled!`,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'fail',
      message: 'Something went very wrong!',
    })
  }
})

exports.login = catchAsync(async(req, res, next) => {
  const {email, password} = req.body

  const user = await User.findOne({
    where: {
      email
    }
  })

  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({
      status: 'error',
      message: 'Incorrect email or Password'
    })
  }

  const token = await generateJWT(user.id);

  res.status(200).json({
    status: 'success',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  })
})