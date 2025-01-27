class APIFeatures {
    constructor(query, queryString) {
      this.query = query;
      this.queryString = queryString;
    }
  
    filter() {
      const queryobj = { ...this.queryString };
      const excluedFields = ['page', 'sort', 'limit', 'fields'];
      excluedFields.forEach((field) => delete queryobj[field]);
  
      let queryStr = JSON.stringify(queryobj);
      queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);
  
      this.query = this.query.find(JSON.parse(queryStr));
      return this;
    }
  
    sort() {
      if (this.queryString.sort) {
        console.log(this.queryString.sort);
        const sortBy = this.queryString.sort.split(',').join(' '); // Corrected to this.queryString.sort
        this.query = this.query.sort(sortBy);
      } else {
        this.query = this.query.sort('-createdAt');
      }
      return this;
    }
  
    limitFields() {
      if (this.queryString.fields) {
        const fields = this.queryString.fields.split(',').join(' ');
        this.query = this.query.select(fields);
      } else {
        this.query = this.query.select('-__v');
      }
      return this;
    }
  
    pagination() {
      const page = parseInt(this.queryString.page, 10) || 1;
      const limit = parseInt(this.queryString.limit, 10) || 10;
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
      return this;
    }
  }

module.exports = APIFeatures;