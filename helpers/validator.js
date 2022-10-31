const common = require("./common");

function isSignUpTotalFieldsValid(totalFields) {
    const TOTAL_MANDATORY_FIELDS = 4;

    common.isTotalFieldsValid(totalFields, TOTAL_MANDATORY_FIELDS);
}

function isGetParentTotalFieldsValid(totalFields) {
    const TOTAL_MANDATORY_FIELDS = 1;

    common.isTotalFieldsValid(totalFields, TOTAL_MANDATORY_FIELDS);
}

function isLoginTotalFieldsValid(totalFields) {
    const TOTAL_MANDATORY_FIELDS = 2;

    common.isTotalFieldsValid(totalFields, TOTAL_MANDATORY_FIELDS);
}

function isCheckParentTotalFieldsValid(totalFields) {
    const TOTAL_MANDATORY_FIELDS = 2;

    common.isTotalFieldsValid(totalFields, TOTAL_MANDATORY_FIELDS);
}

function isUpdateProfileFieldsValid(totalFields) {
    const TOTAL_MANDATORY_FIELDS = 5;

    common.isTotalFieldsValid(totalFields, TOTAL_MANDATORY_FIELDS);
}

function isSubmitProfileFieldsValid(totalFields) {
    const TOTAL_MANDATORY_FIELDS = 4;

    common.isTotalFieldsValid(totalFields, TOTAL_MANDATORY_FIELDS);
}

function isSubmitPasswordFieldValid(totalFields) {
    const TOTAL_MANDATORY_FIELDS = 3;

    common.isTotalFieldsValid(totalFields, TOTAL_MANDATORY_FIELDS);
}

function isUpdatePasswordTotalFieldsValid(totalFields) {
    const TOTAL_MANDATORY_FIELDS = 4;

    common.isTotalFieldsValid(totalFields, TOTAL_MANDATORY_FIELDS);
}

function isFirstNameValid(firstName) {
    return validateUserIdentity(firstName, "First Name");
}

function isLastNameValid(lastName) {
    return validateUserIdentity(lastName, "Last Name");
}

function validateUserIdentity(_name, variableName) {
    common.isArgumentString(_name, variableName);
    common.isStringEmpty(_name, variableName);

    const name = _name.trim();

    common.isStringAlphaSpace(name, variableName);

    return name;
}

function isEmailValid(_email) {
    common.isArgumentString(_email, "email");
    common.isStringEmpty(_email, "email");

    const email = _email.trim().toLowerCase();

    common.isEmail(email);

    return email;
}

function isBirthDateValid(_dateOfBirth) {
    common.isArgumentString(_dateOfBirth, "date of birth");
    common.isStringEmpty(_dateOfBirth, "date of birth");

    const dateOfBirth = _dateOfBirth.trim();

    common.isDate(dateOfBirth);
    common.isBirthDate(dateOfBirth);

    return dateOfBirth;
}

function isPasswordValid(password) {
    common.isArgumentString(password, "password");
    common.isStringEmpty(password, "password");
    common.isNonSpaceString(password, "Password");

    const MINIMUM_PASSWORD_LENGTH = 8;

    common.isStringLengthValid(password, MINIMUM_PASSWORD_LENGTH, "Password");

    return password;
}

function isParentIdValid(_parentId) {
    common.isArgumentString(_parentId, "parent id");
    common.isStringEmpty(_parentId, "parent id");

    const parentId = _parentId.trim();

    common.isUuid(parentId);

    return parentId;
}

function isChildIdValid(_childId) {
    common.isArgumentString(_childId, "child id");
    common.isStringEmpty(_childId, "child id");

    const childId = _childId.trim();

    common.isUuid(childId);

    return childId;
}

function isVerificationTokenValid(_verificationToken) {
    common.isArgumentString(_verificationToken, "verification token");
    common.isStringEmpty(_verificationToken, "verification token");

    const verificationToken = _verificationToken.trim();

    common.isUuid(verificationToken);

    return verificationToken;
}

module.exports = {
    isSignUpTotalFieldsValid,
    isGetParentTotalFieldsValid,
    isLoginTotalFieldsValid,
    isCheckParentTotalFieldsValid,
    isUpdateProfileFieldsValid,
    isSubmitProfileFieldsValid,
    isSubmitPasswordFieldValid,
    isUpdatePasswordTotalFieldsValid,
    isFirstNameValid,
    isLastNameValid,
    isEmailValid,
    isBirthDateValid,
    isPasswordValid,
    isParentIdValid,
    isVerificationTokenValid,
    isChildIdValid,
};
