const onlyLoggedUsers = (req, res, next) => {
  if (req.session.user_id) {
    next();
  } else {
    res.status(401).send({ err: "sensetive content for logged users only" });
  }
};

module.exports = { onlyLoggedUsers };
