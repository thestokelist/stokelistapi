const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../db')

class Post extends Model {}

Post.init({
    id: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true, 
    },               
     title: { type : DataTypes.STRING },          
     price: { type : DataTypes.STRING },
     priceInCents: { type: DataTypes.INTEGER, field: 'price_in_cents' },
     location: { type : DataTypes.STRING },
     description: { type : DataTypes.TEXT },
     email: { type : DataTypes.STRING },
     photoFileName: { type : DataTypes.STRING, field: 'photo_file_name'  },
     photoContentType: { type : DataTypes.STRING, field: 'photo_content_type'  },
     photoFileSize: { type: DataTypes.INTEGER, field: 'photo_file_size'  },
     guid: { type : DataTypes.STRING },
     isIdiotic: { type : DataTypes.BOOLEAN, defaultValue: false, field: 'is_idiotic' }, 
     isAwesome: { type : DataTypes.BOOLEAN, defaultValue: false, field: 'is_awesome' },
     sticky: { type : DataTypes.BOOLEAN, defaultValue: false },
     emailVerified: { type : DataTypes.BOOLEAN, defaultValue: false, field: 'email_verified' },
     tags: { type : DataTypes.STRING },
     computedTags: { type : DataTypes.STRING, field: 'computed_tags' },
     remoteIp: { type : DataTypes.STRING, field: 'remote_ip' },
     originatingCountry: { type : DataTypes.STRING, field: 'originating_country' },
     originatingRegion: { type : DataTypes.STRING, field: 'originating_region' },
     originatingLatLng: { type : DataTypes.STRING, field: 'originating_lat_lng' },
}, {
  // Other model options go here
  sequelize,
  modelName: 'Post',
  tableName: 'posts',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at'
});

(async () => {
    await sequelize.sync({ force: false });
    // Code here
  })();

  module.exports = Post