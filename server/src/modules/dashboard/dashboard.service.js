const User = require('../users/user.model');
const Product = require('../products/product.model');
const KOLProfile = require('../kol/kolProfile.model');
const Role = require('../roles/role.model');
const { ROLES } = require('../../common/constants/roles');

class DashboardService {
  async getSummary() {
    const [staffRole, kolRole] = await Promise.all([
      Role.findOne({ name: ROLES.STAFF }),
      Role.findOne({ name: ROLES.KOL }),
    ]);

    const [
      totalProducts,
      totalKOL,
      totalStaff,
      viewsAgg,
      clicksAgg,
      topProducts,
      topKOLAgg,
    ] = await Promise.all([
      Product.countDocuments({}),
      KOLProfile.countDocuments({}),
      staffRole ? User.countDocuments({ role: staffRole._id }) : 0,
      Product.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]),
      Product.aggregate([{ $group: { _id: null, total: { $sum: '$clickCount' } } }]),
      Product.find().sort({ clickCount: -1 }).limit(5).select('name slug clickCount viewCount'),
      require('../kol/kolProduct.model').aggregate([
        { $group: { _id: '$kol', totalClicks: { $sum: '$clickCount' } } },
        { $sort: { totalClicks: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'kolprofiles',
            localField: '_id',
            foreignField: '_id',
            as: 'kol',
          },
        },
        { $unwind: '$kol' },
        { $project: { totalClicks: 1, 'kol.displayName': 1, 'kol.route': 1, 'kol.avatar': 1 } },
      ]),
    ]);

    return {
      totalProducts,
      totalKOL,
      totalStaff,
      totalViews: viewsAgg[0]?.total || 0,
      totalAffiliateClicks: clicksAgg[0]?.total || 0,
      topProducts,
      topKOL: topKOLAgg,
    };
  }
}

module.exports = new DashboardService();
