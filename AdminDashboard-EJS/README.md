**🔐 AUTHENTICATION FLOWS**
*📝 1. Register*

| Step | Process                            |
| ---- | ---------------------------------- |
| 1    | User submits name, email, password |
| 2    | Validate input                     |
| 3    | Create user in DB                  |
| 4    | Generate email verification token  |
| 5    | Hash token & set 24h expiry        |
| 6    | Send verification email            |
| 7    | Log activity (REGISTER)            |
| 8    | Send API response                  |

*📩 2. Verify Email*

| Step | Process                       |
| ---- | ----------------------------- |
| 1    | User clicks verification link |
| 2    | Hash token from URL           |
| 3    | Find user + check expiry      |
| 4    | Set isEmailVerified = true    |
| 5    | Set isActive = true           |
| 6    | Remove verification token     |
| 7    | Save user                     |
| 8    | Send API response             |

*🔑 3. Login*

| Step | Process                      |
| ---- | ---------------------------- |
| 1    | User enters email & password |
| 2    | Validate fields              |
| 3    | Find user (+password)        |
| 4    | Match password               |
| 5    | Check email verified         |
| 6    | Check account active         |
| 7    | Save LoginHistory            |
| 8    | Generate JWT token (1h)      |
| 9    | Set HTTP-only cookie         |
| 10   | Log activity (LOGIN)         |
| 11   | Send API response            |

*🔁 4. Forgot Password*

| Step | Process                        |
| ---- | ------------------------------ |
| 1    | User submits email             |
| 2    | Validate email                 |
| 3    | Find user                      |
| 4    | Generate reset token           |
| 5    | Hash token & set 10 min expiry |
| 6    | Send reset email               |
| 7    | Log activity                   |
| 8    | Send API response              |

*🔄 5. Reset Password*

| Step | Process                         |
| ---- | ------------------------------- |
| 1    | User opens reset link           |
| 2    | Hash token                      |
| 3    | Find user + check expiry        |
| 4    | Validate new & confirm password |
| 5    | Update password                 |
| 6    | Remove reset token              |
| 7    | Save user                       |
| 8    | Log activity                    |
| 9    | Send API response               |

*🔒 6. Change Password (Logged-in)*

| Step | Process                         |
| ---- | ------------------------------- |
| 1    | User submits old + new password |
| 2    | Validate fields                 |
| 3    | Find user (+password)           |
| 4    | Match old password              |
| 5    | Validate new & confirm match    |
| 6    | Update password                 |
| 7    | Save user                       |
| 8    | Clear JWT cookie                |
| 9    | Log activity                    |
| 10   | Send API response               |

**👤 USER MANAGEMENT FLOWS**
*📋 7. Get All Users (Admin)*

| Step | Process                                  |
| ---- | ---------------------------------------- |
| 1    | Admin request                            |
| 2    | Apply filters (role, isActive, verified) |
| 3    | Apply search (name/email)                |
| 4    | Apply cursor pagination                  |
| 5    | Fetch users                              |
| 6    | Send response with pageInfo              |

*🔁 8. Toggle User Status*

| Step | Process                       |
| ---- | ----------------------------- |
| 1    | Admin sends userId + isActive |
| 2    | Validate request              |
| 3    | Update user status            |
| 4    | Log activity                  |
| 5    | Send API response             |

*📦 9. Bulk Operations (Admin)*

| Operation       | Flow                                                         |
| --------------- | ------------------------------------------------------------ |
| Bulk Activate   | Validate IDs → updateMany(isActive:true) → Log → Response    |
| Bulk Deactivate | Validate IDs → updateMany(isActive:false) → Log → Response   |
| Bulk Delete     | Validate IDs → deleteMany → Log → Response                   |
| Bulk Create     | Validate list → Hash passwords → insertMany → Log → Response |

**📝 BLOGS FLOWS**
*📝 1️⃣ CREATE BLOG*

| Step | Process         | Description                          |
| ---- | --------------- | ------------------------------------ |
| 1    | User Request    | Title, content, tags submit          |
| 2    | Trim Title      | Remove extra spaces                  |
| 3    | Check Duplicate | Same title already exists?           |
| 4    | Format Tags     | Trim + remove empty tags             |
| 5    | Create Blog     | Save blog with author (req.user._id) |
| 6    | Log Activity    | Action: CREATE_BLOG                  |
| 7    | API Response    | 201 Created + Blog Data              |

*📚 2️⃣ GET ALL BLOGS*

| Step | Process          | Description                         |
| ---- | ---------------- | ----------------------------------- |
| 1    | Request          | limit, cursor, search, sort         |
| 2    | Apply Search     | Title / Content / Tags regex        |
| 3    | Apply Cursor     | _id > or < based on sort            |
| 4    | Fetch Blogs      | Populate author (name, email, role) |
| 5    | Pagination Logic | limit + 1 → check hasNextPage       |
| 6    | Prepare pageInfo | hasNextPage, nextCursor             |
| 7    | API Response     | Blogs list + pageInfo               |

*🔍 3️⃣ GET SINGLE BLOG*

| Step | Process      | Description             |
| ---- | ------------ | ----------------------- |
| 1    | Get blogId   | From params             |
| 2    | Find Blog    | By ID + populate author |
| 3    | Check Exists | If not → 404            |
| 4    | API Response | Blog data               |

*📊 4️⃣ GET BLOG STATS*

| Step | Process         | Description          |
| ---- | --------------- | -------------------- |
| 1    | Get Today Date  | Start of current day |
| 2    | Aggregate Query | Using $facet         |
| 3    | Count Total     | All blogs            |
| 4    | Count Published | isPublished: true    |
| 5    | Count Draft     | isPublished: false   |
| 6    | Count Today     | createdAt >= today   |
| 7    | API Response    | Stats object         |

*✏️ 5️⃣ UPDATE BLOG*

| Step | Process             | Description                       |
| ---- | ------------------- | --------------------------------- |
| 1    | Get blogId          | From params                       |
| 2    | Find Blog           | By ID                             |
| 3    | Check Exists        | If not → 404                      |
| 4    | Authorization Check | Author OR Admin                   |
| 5    | Update Fields       | title, content, tags, isPublished |
| 6    | Save Blog           | Persist changes                   |
| 7    | Log Activity        | UPDATE_BLOG                       |
| 8    | API Response        | Updated blog                      |

*🗑 6️⃣ DELETE BLOG*

| Step | Process             | Description       |
| ---- | ------------------- | ----------------- |
| 1    | Get blogId          | From params       |
| 2    | Find Blog           | By ID             |
| 3    | Check Exists        | If not → 404      |
| 4    | Authorization Check | Author OR Admin   |
| 5    | Store Deleted Data  | For response      |
| 6    | Delete Blog         | findByIdAndDelete |
| 7    | Log Activity        | DELETE_BLOG       |
| 8    | API Response        | Deleted blog info |

*📦 7️⃣ BULK PUBLISH / UNPUBLISH*

| Step | Process        | Description                   |
| ---- | -------------- | ----------------------------- |
| 1    | Admin Request  | blogIds + isPublished         |
| 2    | Validate Input | blogIds exist + boolean check |
| 3    | Update Many    | updateMany({_id:{$in:ids}})   |
| 4    | Log Activity   | BULK_TOGGLE_PUBLISH_BLOGS     |
| 5    | API Response   | Success message               |

*🖼 8️⃣ UPLOAD BLOG IMAGE*

| Step | Process      | Description              |
| ---- | ------------ | ------------------------ |
| 1    | File Upload  | Check req.file           |
| 2    | Validate     | If no file → 400         |
| 3    | Save File    | (Handled by middleware)  |
| 4    | API Response | uploaded:true + file URL |

**🛍️ PRODUCT MANAGEMENT FLOWS**

*1️⃣ ADD PRODUCT*

| Step | Process         | Description                     |
| ---- | --------------- | ------------------------------- |
| 1    | Validate Body   | Check empty request             |
| 2    | Extract Fields  | title, description, price, etc. |
| 3    | Handle Image    | Get req.file.path               |
| 4    | Check Duplicate | Title already exists?           |
| 5    | Create Product  | Save with createdBy             |
| 6    | Log Activity    | ADD_PRODUCT (success)           |
| 7    | Response        | 201 + Product Data              |

*2️⃣ GET ALL PRODUCTS*

| Step | Process          | Description                          |
| ---- | ---------------- | ------------------------------------ |
| 1    | Query Params     | limit, cursor, search, sort          |
| 2    | Apply Search     | Regex on title, brand, category etc. |
| 3    | Apply Filters    | isApproved, isFeatured               |
| 4    | Apply Cursor     | _id > / <                            |
| 5    | Populate Reviews | Only approved reviews + user name    |
| 6    | Pagination       | limit+1 → hasNextPage                |
| 7    | Response         | Products + pageInfo                  |

*3️⃣ GET SINGLE PRODUCT*

| Step | Process            | Description    |
| ---- | ------------------ | -------------- |
| 1    | Validate productId | ObjectId check |
| 2    | Find Product       | By ID          |
| 3    | Populate Reviews   | Approved only  |
| 4    | Not Found?         | Return 404     |
| 5    | Response           | Product Data   |

*4️⃣ PRODUCT STATS*

| Step | Process            | Description                               |
| ---- | ------------------ | ----------------------------------------- |
| 1    | Get Today Date     | Start of day                              |
| 2    | Aggregate ($facet) | total, inStock, approved, featured, today |
| 3    | Extract Counts     | Default 0 fallback                        |
| 4    | Response           | Stats object                              |

*5️⃣ EDIT PRODUCT*

| Step | Process         | Description                 |
| ---- | --------------- | --------------------------- |
| 1    | Validate Fields | At least one field required |
| 2    | Find Product    | By ID                       |
| 3    | Validate Values | price > 0, title not empty  |
| 4    | Update Fields   | Assign new values           |
| 5    | Validate Schema | product.validate()          |
| 6    | Save Product    | Persist changes             |
| 7    | Log Activity    | EDIT_PRODUCT                |
| 8    | Response        | Updated product             |

*6️⃣ DELETE PRODUCT*

| Step | Process        | Description          |
| ---- | -------------- | -------------------- |
| 1    | Find Product   | By ID                |
| 2    | Not Found?     | 404                  |
| 3    | Delete Product | findByIdAndDelete    |
| 4    | Log Activity   | DELETE_PRODUCT       |
| 5    | Response       | Deleted product data |

*7️⃣ TOGGLE PRODUCT APPROVAL (Admin)*

| Step | Process            | Description             |
| ---- | ------------------ | ----------------------- |
| 1    | Validate productId | ObjectId check          |
| 2    | Find Product       | By ID                   |
| 3    | Toggle isApproved  | true/false              |
| 4    | Save Product       | Update DB               |
| 5    | Log Activity       | TOGGLE_PRODUCT_APPROVAL |
| 6    | Response           | Updated approval status |

*8️⃣ TOGGLE FEATURED PRODUCT*

| Step | Process            | Description             |
| ---- | ------------------ | ----------------------- |
| 1    | Validate productId | ObjectId check          |
| 2    | Find Product       | By ID                   |
| 3    | Check Approved     | Only approved allowed   |
| 4    | Toggle isFeatured  | true/false              |
| 5    | Save Product       | Update DB               |
| 6    | Log Activity       | TOGGLE_FEATURED_PRODUCT |
| 7    | Response           | Updated product         |

*9️⃣ LOW STOCK PRODUCTS*

| Step | Process         | Description            |
| ---- | --------------- | ---------------------- |
| 1    | Get Threshold   | Default = 5            |
| 2    | Query Products  | inventory <= threshold |
| 3    | Filter Approved | isApproved: true       |
| 4    | Sort            | Ascending inventory    |
| 5    | Log Activity    | GET_LOW_STOCK_PRODUCTS |
| 6    | Response        | Products list          |

*🔟 BULK UPLOAD PRODUCTS (CSV)*

| Step | Process          | Description             |
| ---- | ---------------- | ----------------------- |
| 1    | Check File       | req.file required       |
| 2    | Parse CSV        | Read rows               |
| 3    | Validate Headers | Required vs Missing     |
| 4    | Format Data      | Convert arrays, numbers |
| 5    | InsertMany       | ordered:false           |
| 6    | Delete Temp File | Cleanup                 |
| 7    | Response         | Insert count            |

*1️⃣1️⃣ EXPORT PRODUCTS (CSV)*

| Step | Process        | Description         |
| ---- | -------------- | ------------------- |
| 1    | Authenticate   | User required       |
| 2    | Fetch Products | All products        |
| 3    | Format Fields  | Flatten attributes  |
| 4    | Convert to CSV | json2csv            |
| 5    | Set Headers    | text/csv            |
| 6    | Send File      | products_export.csv |

*1️⃣2️⃣ MANAGE INVENTORY*

| Step | Process            | Description      |
| ---- | ------------------ | ---------------- |
| 1    | Validate productId | ObjectId check   |
| 2    | Validate Quantity  | > 0 required     |
| 3    | Find Product       | By ID            |
| 4    | Update Inventory   | += quantity      |
| 5    | Save Product       | Persist          |
| 6    | Log Activity       | MANAGE_INVENTORY |
| 7    | Response           | New stock value  |

**⭐ REVIEW MANAGEMENT FLOWS**
*1️⃣ ADD REVIEW*

| Step | Process            | Description           |
| ---- | ------------------ | --------------------- |
| 1    | Validate productId | ObjectId check        |
| 2    | Validate Rating    | 1–5 only              |
| 3    | Find Product       | Must exist            |
| 4    | Check Approved     | Only approved product |
| 5    | Create Review      | Save review           |
| 6    | Push to Product    | Add review ID         |
| 7    | Recalculate Stats  | avgRating + count     |
| 8    | Save Product       | Update rating fields  |
| 9    | Log Activity       | ADD_REVIEW            |
| 10   | Response           | Product + Review      |

*2️⃣ TOGGLE REVIEW APPROVAL (Admin)*

| Step | Process                   | Description            |
| ---- | ------------------------- | ---------------------- |
| 1    | Find Review               | By ID                  |
| 2    | Toggle isApproved         | true/false             |
| 3    | Save Review               | Update DB              |
| 4    | Recalculate Product Stats | avg + count            |
| 5    | Update Product            | Save stats             |
| 6    | Log Activity              | TOGGLE_REVIEW_APPROVAL |
| 7    | Response                  | Updated review         |

*3️⃣ REPORT REVIEW*

| Step | Process                | Description        |
| ---- | ---------------------- | ------------------ |
| 1    | Find Review            | By ID              |
| 2    | Check Already Reported | Same user?         |
| 3    | Increase reportCount   | +1                 |
| 4    | Push reportedBy        | Save user + reason |
| 5    | Auto Unapprove         | If reportCount ≥ 3 |
| 6    | Save Review            | Persist            |
| 7    | Log Activity           | REPORT_REVIEW      |
| 8    | Response               | Success message    |

*4️⃣ UPDATE REVIEW*

| Step | Process           | Description       |
| ---- | ----------------- | ----------------- |
| 1    | Validate reviewId | ObjectId check    |
| 2    | Find Review       | By ID             |
| 3    | Authorization     | Only review owner |
| 4    | Validate Rating   | 1–5               |
| 5    | Update Fields     | rating/comment    |
| 6    | Save Review       | Persist           |
| 7    | Recalculate Stats | avg + count       |
| 8    | Update Product    | Save stats        |
| 9    | Response          | Updated review    |

*5️⃣ DELETE REVIEW*

| Step | Process           | Description      |
| ---- | ----------------- | ---------------- |
| 1    | Validate reviewId | ObjectId check   |
| 2    | Find Review       | By ID            |
| 3    | Authorization     | Only owner       |
| 4    | Delete Review     | Remove document  |
| 5    | Pull from Product | Remove review ID |
| 6    | Recalculate Stats | avg + count      |
| 7    | Update Product    | Save stats       |
| 8    | Response          | Success message  |

**🛒 CART MANAGEMENT FLOWS**
*1️⃣ ADD TO CART*

| Step | Process             | Description                       |
| ---- | ------------------- | --------------------------------- |
| 1    | Extract Data        | productId, quantity (default = 1) |
| 2    | Validate ObjectId   | productId must be valid           |
| 3    | Validate Quantity   | 1 – 1000 range                    |
| 4    | Find Product        | Check product exists              |
| 5    | Check Inventory     | inventory ≥ quantity              |
| 6    | Find/Create Cart    | If not exists → create new cart   |
| 7    | Check Existing Item | If product already in cart        |
| 8    | Update / Push Item  | Increase qty OR add new item      |
| 9    | Update Totals       | totalItems + totalAmount          |
| 10   | Update Meta Fields  | updatedBy, abandoned = false      |
| 11   | Save Cart           | Persist changes                   |
| 12   | Log Activity        | ADD_TO_CART                       |
| 13   | Populate Items      | Product details                   |
| 14   | Response            | 201 + Updated Cart                |

*2️⃣ GET CART (USER)*

| Step | Process           | Description                    |
| ---- | ----------------- | ------------------------------ |
| 1    | Check Role        | If not admin                   |
| 2    | Find Cart         | By userId                      |
| 3    | Populate Products | title, price, brand, inventory |
| 4    | If Not Found      | Return empty cart structure    |
| 5    | Response          | Cart Data                      |

*3️⃣ GET CART (ADMIN – ADVANCED FILTER)*

| Step | Process            | Description                  |
| ---- | ------------------ | ---------------------------- |
| 1    | Extract Query      | page, limit, search, filters |
| 2    | Search Products    | title, brand, category       |
| 3    | Search Users       | name, email                  |
| 4    | Apply Price Filter | minPrice / maxPrice          |
| 5    | Apply Date Filter  | startDate / endDate          |
| 6    | Apply Cart Filter  | active / empty / abandoned   |
| 7    | Apply Sort         | updatedAt / totalAmount      |
| 8    | Execute Query      | With populate                |
| 9    | Count Documents    | For pagination               |
| 10   | Response           | Carts + Pagination Info      |

*4️⃣ GET SPECIFIC CART (ADMIN)*

| Step | Process            | Description                    |
| ---- | ------------------ | ------------------------------ |
| 1    | Validate cartId    | ObjectId check                 |
| 2    | Check Admin Role   | Only admin allowed             |
| 3    | Find Cart          | By ID                          |
| 4    | Populate Relations | user, items.product, updatedBy |
| 5    | Not Found?         | 404                            |
| 6    | Response           | Cart Data                      |

*5️⃣ UPDATE CART ITEM*

| Step | Process            | Description                |
| ---- | ------------------ | -------------------------- |
| 1    | Extract Data       | productId, quantity        |
| 2    | Validate ObjectId  | productId check            |
| 3    | Validate Quantity  | ≥ 0 (0 = remove)           |
| 4    | Find Cart          | By userId                  |
| 5    | Find Item Index    | In cart.items              |
| 6    | Find Product       | Check inventory            |
| 7    | If quantity = 0    | Remove item                |
| 8    | Else               | Update qty + price         |
| 9    | Recalculate Totals | totalItems, totalAmount    |
| 10   | Update Meta        | updatedBy, abandoned=false |
| 11   | Save Cart          | Persist                    |
| 12   | Log Activity       | UPDATE_CART_ITEM           |
| 13   | Response           | Updated Cart               |

*6️⃣ REMOVE FROM CART*

| Step | Process            | Description       |
| ---- | ------------------ | ----------------- |
| 1    | Validate productId | ObjectId check    |
| 2    | Find Cart          | By userId         |
| 3    | Find Item          | In cart           |
| 4    | Remove Item        | Splice from array |
| 5    | Recalculate Totals | Update totals     |
| 6    | Update Meta        | updatedBy         |
| 7    | Save Cart          | Persist           |
| 8    | Log Activity       | REMOVE_FROM_CART  |
| 9    | Response           | Updated Cart      |

*7️⃣ CLEAR CART*

| Step | Process        | Description                |
| ---- | -------------- | -------------------------- |
| 1    | Find & Update  | findOneAndUpdate           |
| 2    | Reset Fields   | items=[], totals=0         |
| 3    | Update Meta    | abandoned=false, updatedBy |
| 4    | Upsert Option  | Create if not exists       |
| 5    | Log Activity   | CLEAR_CART                 |
| 6    | Populate Items | (Empty list)               |
| 7    | Response       | Cleared Cart               |

*8️⃣ GET CART STATS (AGGREGATION)*

| Step | Process            | Description             |
| ---- | ------------------ | ----------------------- |
| 1    | Aggregate ($facet) | Multiple pipelines      |
| 2    | totalCarts         | Count all carts         |
| 3    | totalItems         | Sum of item quantities  |
| 4    | totalValue         | Sum of quantity × price |
| 5    | Extract Results    | Default fallback 0      |
| 6    | Response           | Stats Object            |

**🧮 INTERNAL HELPER FLOW**
*updateCartTotals(cart)*

| Step | Process               | Description          |
| ---- | --------------------- | -------------------- |
| 1    | Calculate totalItems  | Sum of quantities    |
| 2    | Calculate totalAmount | quantity × price sum |
| 3    | Assign Values         | Update cart fields   |

**🛒ORDER MANAGEMENT FLOW**
*1️⃣ CREATE ORDER FLOW*

| Step | Process               | Description                              |
| ---- | --------------------- | ---------------------------------------- |
| 1    | Get User              | Fetch user name                          |
| 2    | Validate Input        | shippingAddress + paymentMethod required |
| 3    | Prepare Address       | Add fullName fallback                    |
| 4    | Fetch Cart            | Populate items.product                   |
| 5    | Check Empty Cart      | If empty → 400                           |
| 6    | Validate Inventory    | Each product stock check                 |
| 7    | Prepare Order Data    | Map cart items                           |
| 8    | Generate Order Number | Custom function                          |
| 9    | Create Order          | Save to DB                               |
| 10   | Reduce Inventory      | $inc: -quantity                          |
| 11   | Clear Cart            | Reset items + totals                     |
| 12   | Log Activity          | CREATE_ORDER                             |
| 13   | Populate Order        | Product + user                           |
| 14   | Response              | 201 + Order Data                         |

*📦 2️⃣ GET USER ORDERS FLOW*

| Step | Process         | Description            |
| ---- | --------------- | ---------------------- |
| 1    | Extract Query   | page, limit, filters   |
| 2    | Build Query     | user: userId           |
| 3    | Apply Search    | orderNumber / notes    |
| 4    | Apply Filters   | status, paymentStatus  |
| 5    | Date Filter     | createdAt range        |
| 6    | Amount Filter   | minAmount / maxAmount  |
| 7    | Execute Query   | sort by createdAt desc |
| 8    | Count Documents | For pagination         |
| 9    | Response        | Orders + Pagination    |

*🔍 3️⃣ GET SINGLE ORDER FLOW*

| Step | Process           | Description    |
| ---- | ----------------- | -------------- |
| 1    | Validate ObjectId | orderId        |
| 2    | Role Check        | Admin OR Owner |
| 3    | Find Order        | With populate  |
| 4    | Not Found?        | 404            |
| 5    | Response          | Order Data     |

*🏢 4️⃣ GET ALL ORDERS (ADMIN)*

| Step | Process               | Description                |
| ---- | --------------------- | -------------------------- |
| 1    | Admin Check           | Role required              |
| 2    | Extract Filters       | search, status, city, etc. |
| 3    | Apply Search          | orderNumber, name, phone   |
| 4    | Apply Status Filters  | status, paymentStatus      |
| 5    | Apply Date Range      | createdAt                  |
| 6    | Apply Amount Range    | totalAmount                |
| 7    | Apply Location Filter | city, state                |
| 8    | Apply Sort            | createdAt / totalAmount    |
| 9    | Execute Query         | With populate              |
| 10   | Pagination            | limit + skip               |
| 11   | Response              | Orders + Filters Applied   |

*🔄 5️⃣ UPDATE ORDER STATUS (ADMIN)*

| Step | Process               | Description                               |
| ---- | --------------------- | ----------------------------------------- |
| 1    | Admin Check           | Role required                             |
| 2    | Validate ObjectId     | orderId                                   |
| 3    | Find Current Order    | By ID                                     |
| 4    | Update Status         | pending / shipped / delivered / cancelled |
| 5    | If Shipped            | Generate trackingNumber + shippedAt       |
| 6    | If Delivered          | Set deliveredAt                           |
| 7    | If Cancelled          | Clear tracking + set cancelledAt          |
| 8    | Update Payment Status | If paid → generate invoiceNumber          |
| 9    | Save Order            | runValidators: true                       |
| 10   | Log Activity          | UPDATE_ORDER_STATUS                       |
| 11   | Response              | Updated Order + tracking + invoice        |

*❌ 6️⃣ CANCEL ORDER (USER)*

| Step | Process           | Description                       |
| ---- | ----------------- | --------------------------------- |
| 1    | Validate ObjectId | orderId                           |
| 2    | Find User Order   | By userId                         |
| 3    | Check Status      | Cannot cancel delivered/cancelled |
| 4    | Restore Inventory | $inc: +quantity                   |
| 5    | Update Status     | cancelled                         |
| 6    | Save Order        | Persist                           |
| 7    | Log Activity      | CANCEL_ORDER                      |
| 8    | Response          | Cancelled Order                   |

*📊 7️⃣ GET ORDER STATS (ADMIN)*

| Step | Process            | Description                       |
| ---- | ------------------ | --------------------------------- |
| 1    | Admin Check        | Role required                     |
| 2    | Aggregate          | $group                            |
| 3    | Count Total Orders | $sum:1                            |
| 4    | Calculate Revenue  | $sum: totalAmount                 |
| 5    | Count By Status    | pending, shipped, delivered, etc. |
| 6    | Response           | Stats Object                      |

*💰 8️⃣ REQUEST REFUND (USER)*

| Step | Process             | Description              |
| ---- | ------------------- | ------------------------ |
| 1    | Find Order          | By orderId + user        |
| 2    | Validate Status     | Must be delivered        |
| 3    | Check Refund Status | Must be "none"           |
| 4    | Create Refund       | Save amount + reason     |
| 5    | Update Order        | refundStatus = requested |
| 6    | Log Activity        | REQUEST_REFUND           |
| 7    | Response            | Refund Data              |

*🔁 9️⃣ UPDATE REFUND STATUS (ADMIN)*

| Step | Process              | Description                           |
| ---- | -------------------- | ------------------------------------- |
| 1    | Admin Check          | Role required                         |
| 2    | Validate Status      | requested/approved/rejected/processed |
| 3    | Find Refund          | Populate order                        |
| 4    | Update Refund Status | Save new status                       |
| 5    | If Approved          | order.refundStatus = approved         |
| 6    | If Processed         | Mark order cancelled                  |
| 7    | Update Payment       | paymentStatus = refunded              |
| 8    | Restore Inventory    | Increase stock                        |
| 9    | Save Order + Refund  | Persist                               |
| 10   | Log Activity         | UPDATE_REFUND_STATUS                  |
| 11   | Response             | Updated Refund                        |

*📂 🔟 GET ALL REFUNDS (ADMIN)*

*👤 1️⃣1️⃣ GET USER REFUNDS*

| Step | Process       | Description         |
| ---- | ------------- | ------------------- |
| 1    | Query By User | user: req.user._id  |
| 2    | Apply Filters | status + date range |
| 3    | Apply Search  | reason              |
| 4    | Execute Query | Populate order      |
| 5    | Pagination    | limit + skip        |
| 6    | Response      | User Refunds        |

*🧾 1️⃣2️⃣ DOWNLOAD INVOICE*

| Step | Process           | Description                    |
| ---- | ----------------- | ------------------------------ |
| 1    | Find Order        | By orderId                     |
| 2    | If No Invoice     | Generate invoiceNumber         |
| 3    | Save Invoice Info | invoiceDate                    |
| 4    | Generate PDF      | generateInvoicePDF(order, res) |
| 5    | Stream Response   | Send PDF file                  |


**📌 FAQ MANAGEMENT SYSTEM**
*1️⃣ BULK TOGGLE FAQ STATUS (ADMIN)*

| Step | Process        | Description                     |
| ---- | -------------- | ------------------------------- |
| 1    | Route Hit      | PUT /bulk-toggle-status         |
| 2    | Authentication | protect middleware → verify JWT |
| 3    | Authorization  | Only admin allowed              |
| 4    | Validate Input | faqIds[] + status (true/false)  |
| 5    | Check IDs      | Validate ObjectId format        |
| 6    | Update Many    | updateMany({_id: {$in: ids}})   |
| 7    | Log Activity   | BULK_TOGGLE_FAQ_STATUS          |
| 8    | Response       | Success message + updated count |

*2️⃣ CREATE FAQ (ADMIN)*

| Step | Process         | Description                    |
| ---- | --------------- | ------------------------------ |
| 1    | Route Hit       | POST /create                   |
| 2    | Authentication  | protect middleware             |
| 3    | Authorization   | Admin only                     |
| 4    | Validate Input  | question, answer required      |
| 5    | Trim Fields     | Remove extra spaces            |
| 6    | Check Duplicate | Same question exists?          |
| 7    | Create FAQ      | Save to DB (createdBy = admin) |
| 8    | Log Activity    | CREATE_FAQ                     |
| 9    | Response        | 201 Created + FAQ data         |

*3️⃣ GET FAQ STATS (ADMIN)*

| Step | Process         | Description        |
| ---- | --------------- | ------------------ |
| 1    | Route Hit       | GET /stats         |
| 2    | Authentication  | protect middleware |
| 3    | Authorization   | Admin only         |
| 4    | Aggregate Query | $facet or $group   |
| 5    | Count Total     | Total FAQs         |
| 6    | Count Active    | status = true      |
| 7    | Count Inactive  | status = false     |
| 8    | Count Today     | createdAt >= today |
| 9    | Response        | Stats Object       |

*4️⃣ GET ALL FAQS (USER + ADMIN)*

| Step | Process          | Description                |
| ---- | ---------------- | -------------------------- |
| 1    | Route Hit        | GET /all-faqs              |
| 2    | Authentication   | protect middleware         |
| 3    | Authorization    | User or Admin              |
| 4    | Extract Query    | page, limit, search        |
| 5    | Apply Search     | question regex             |
| 6    | Apply Filter     | status (if needed)         |
| 7    | Apply Pagination | skip + limit               |
| 8    | Execute Query    | Sort by createdAt desc     |
| 9    | Response         | FAQ list + pagination info |

*5️⃣ GET SINGLE FAQ (USER + ADMIN)*

| Step | Process           | Description        |
| ---- | ----------------- | ------------------ |
| 1    | Route Hit         | GET /:faqId        |
| 2    | Authentication    | protect middleware |
| 3    | Authorization     | User or Admin      |
| 4    | Validate ObjectId | faqId              |
| 5    | Find FAQ          | By ID              |
| 6    | If Not Found      | 404 error          |
| 7    | Response          | FAQ data           |

*6️⃣ UPDATE FAQ (ADMIN)*

| Step | Process           | Description              |
| ---- | ----------------- | ------------------------ |
| 1    | Route Hit         | PUT /update/:faqId       |
| 2    | Authentication    | protect middleware       |
| 3    | Authorization     | Admin only               |
| 4    | Validate ObjectId | faqId                    |
| 5    | Find FAQ          | Check exists             |
| 6    | Update Fields     | question, answer, status |
| 7    | Save FAQ          | runValidators: true      |
| 8    | Log Activity      | UPDATE_FAQ               |
| 9    | Response          | Updated FAQ              |

*7️⃣ DELETE FAQ (ADMIN)*

| Step | Process           | Description           |
| ---- | ----------------- | --------------------- |
| 1    | Route Hit         | DELETE /delete/:faqId |
| 2    | Authentication    | protect middleware    |
| 3    | Authorization     | Admin only            |
| 4    | Validate ObjectId | faqId                 |
| 5    | Find FAQ          | Check exists          |
| 6    | Delete FAQ        | findByIdAndDelete     |
| 7    | Log Activity      | DELETE_FAQ            |
| 8    | Response          | Deleted FAQ data      |


**📜 PRIVACY POLICY MANAGEMENT SYSTEM**
*1️⃣ GET PRIVACY POLICY*

| Step | Process          | Description              |
| ---- | ---------------- | ------------------------ |
| 1    | Route Hit        | GET /privacy-policy      |
| 2    | Controller Start | getPolicy()              |
| 3    | Fetch Policy     | PrivacyPolicy.findOne()  |
| 4    | Populate Author  | name, email, role        |
| 5    | Check Exists     | If not found → 404       |
| 6    | Success Response | 200 + Policy Data        |
| 7    | Error Handling   | Catch → 500 Server Error |

*2️⃣ CREATE OR UPDATE PRIVACY POLICY (UPSERT)*

| Step | Process                  | Description                  |
| ---- | ------------------------ | ---------------------------- |
| 1    | Route Hit                | POST /privacy-policy         |
| 2    | Controller Start         | upsertPolicy()               |
| 3    | Validate Body            | req.body must exist          |
| 4    | Validate Sections        | Must be array + min 1        |
| 5    | Validate Each Section    | title + content required     |
| 6    | Trim Fields              | Remove extra spaces          |
| 7    | Check Existing Policy    | PrivacyPolicy.findOne()      |
| 8    | If Policy Exists         | Update flow starts           |
| 9    | Update Fields            | sections + optional isActive |
| 10   | Save Policy              | policy.save()                |
| 11   | Handle Validation Errors | getValidationError()         |
| 12   | Set Action Type          | UPDATE_PRIVACY_POLICY        |
| 13   | Send Success Response    | 200 Updated                  |

*🆕 IF POLICY DOES NOT EXIST (CREATE FLOW)*

| Step | Process                  | Description            |
| ---- | ------------------------ | ---------------------- |
| 1    | Create Policy            | PrivacyPolicy.create() |
| 2    | Set Default isActive     | true if undefined      |
| 3    | Assign Author            | req.user._id           |
| 4    | Handle Validation Errors | getValidationError()   |
| 5    | Set Action Type          | CREATE_PRIVACY_POLICY  |
| 6    | Send Success Response    | 201 Created            |
