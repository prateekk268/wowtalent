const mongoose = require('mongoose')

// for Object Id validation for futher use
const isValidObjectId = function (value) {
  return mongoose.Types.ObjectId.isValid(value)
};

const isValidRequestBody = function (body) {
    return Object.keys(body).length > 0;
};
  
const isValidInputValue = function (data) {
    if (typeof (data) === 'undefined' || data === null) return false
    if (typeof (data) === 'string' && data.trim().length > 0) return true
    if (typeof (data) === 'object'|| Object.values(data) > 0 ) return true
    return false
  }

  const isValidOnlyCharacters = function (data) {
    return /^[A-Za-z ]+$/.test(data)
  }

  const isValidCountryCode = function (value) {
    return ["+91", "+92", "+93", "+61", "+86", "+1", "+44"].indexOf(value) !== -1;
  };

  const isValidGender = function (value) {
    return ["male", "female", "other"].indexOf(value) !== -1;
  };

  const isValidPhone = function (value) {
    const test2 = /^(\+91[\-\s]?)?[0]?(91)?[6-9]\d{9}$/  
    if (typeof value !== 'string') return false
    if(test2.test(value) === false) return false
    return true
  }

const isValidEmail = function (value) {
  const test1 = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/ 
  if (typeof value !== 'string') return false
  if(test1.test(value) === false) return false
  return true
}
  
const isValidPassword = function (value) {
  const test3 = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/ 
  if (typeof value !== 'string') return false
  if(test3.test(value) === false) return false
  return true
}
  
const isValidStatus = function (value) {
    return ["Public", "Private"].indexOf(value) !== -1;
};


  module.exports = { isValidObjectId, isValidStatus, isValidPassword, isValidEmail, isValidInputValue, isValidCountryCode, isValidRequestBody, isValidGender, isValidOnlyCharacters, isValidPhone }