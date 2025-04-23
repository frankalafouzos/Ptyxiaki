let User = require("../models/users.model");


const GetUserByID = async (UserID) =>  {
  try { 
    console.log("ID: " + UserID);
    const user = await User.findById(UserID);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`User fetched successfully ${user}`);
    return(user);
  } catch (error) {
    console.error(error);
    return({ error: 'Server error' });
  }
};

module.exports = GetUserByID;
