const onlyAdminUsers = (req, res, next) => {
  if (req.session.user_id && req.session.role == 1) {
    next();
  } else {
    res.status(401).send({ err: "sensetive content for Admin users only" });
  }
};

module.exports = { onlyAdminUsers };
