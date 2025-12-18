const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
// const createError = require("http-errors");

require("./models/dbconfig");

const usersRouter = require("./routes/users");
const likesRouter = require("./routes/likes");
const articlesRouter = require("./routes/articles");
const commentsRouter = require("./routes/comments");
const coursesRouter = require("./routes/courses");
const couponsRouter = require("./routes/coupons");
const communityRouter = require("./routes/communities");
const purchasesRouter = require("./routes/purchases");
const emailSubsRouter = require("./routes/email_subs");
const bookmarksRouter = require("./routes/bookmarks");
const groupsRouter = require("./routes/groups");
const faqsRouter = require("./routes/faqs");
const feedbacksRouter = require("./routes/feedbacks");
const createError = require("http-errors");
const bodyParser = require("body-parser");
const tagRouter = require("./routes/tags");
const postRouter = require("./routes/posts");
const articleTopicsRouter = require("./routes/articleTopics");
const articleTagsRouter = require("./routes/articleTags");
const babyNamesRouter = require("./routes/baby_names");
const blogRouter = require("./routes/blog");
const subscriptionsRouter = require("./routes/subscriptions");
const aboutUsRouter = require("./routes/aboutUs");
const privacyPolicyRouter = require("./routes/privacyPolicy");
const termsOfUseRouter = require("./routes/termsOfUse");
const contactRouter = require("./routes/contact");

const app = express();
require("dotenv").config();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:8181",
      "http://192.168.29.45:8181",
      "https://prega-center-web.netlify.app",
      "https://pregacenter.tecocraft.us",
      "http://192.168.29.45" 
    ],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.static(path.join(__dirname, "public")));
app.use("/public", express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/users", usersRouter);
app.use("/likes", likesRouter);
app.use("/articles", articlesRouter);
app.use("/comments", commentsRouter);
app.use("/courses", coursesRouter);
app.use("/coupons", couponsRouter);
app.use("/community", communityRouter);
app.use("/purchases", purchasesRouter);
app.use("/emailSubs", emailSubsRouter);
app.use("/bookmarks", bookmarksRouter);
app.use("/groups", groupsRouter);
app.use("/faqs", faqsRouter);
app.use("/feedbacks", feedbacksRouter);
app.use("/tags", tagRouter);
app.use("/posts", postRouter);
app.use("/articleTopics", articleTopicsRouter);
app.use("/articleTags", articleTagsRouter);
app.use("/babyNames", babyNamesRouter);
app.use("/blog", blogRouter);
app.use("/subscriptions", subscriptionsRouter);
app.use("/aboutUs", aboutUsRouter);
app.use("/privacyPolicy", privacyPolicyRouter);
app.use("/termsOfUse", termsOfUseRouter);
app.use("/contact", contactRouter);

app.get("/", async (req, res) => {
  if (req?.cookies?.logged_in_user) {
    res.redirect("/users/admin/dashboard");
  } else {
    res.render("login");
    // res.redirect('/users/admin/login');
  }
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  // res.render("error", {});
  res.json({ error: err.message, success: false });
});

// module.exports = app;

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
