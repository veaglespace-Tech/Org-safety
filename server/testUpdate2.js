const authController = require('./src/controllers/auth.controller');
const prisma = require('./src/config/prisma');

async function test() {
  const req = {
    user: { userId: 1 },
    body: {
      name: "Akshay Singare",
      email: "singareakshay937@gmail.com",
      phone: "7020540649",
      emergencyContact: "+917020540649",
      city: "Pune",
      gender: "MALE",
      bloodGroup: "O+",
      currentAddress: "Pune",
      permanentAddress: "Pune",
      password: "",
      profilePhoto: ""
    }
  };
  const res = {
    status: function(code) {
      console.log('Status:', code);
      return this;
    },
    json: function(data) {
      console.log('JSON:', data);
    }
  };
  
  await authController.updateMe(req, res);
  prisma.$disconnect();
}
test();
