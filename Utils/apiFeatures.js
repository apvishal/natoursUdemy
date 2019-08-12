class APIFeatures {
  constructor(query, queryInfo) {
    this.query = query;
    this.queryInfo = queryInfo;
  }
  filter() {
    console.log('FILETER');
    // array of keywords we want to remove...
    const queryObj = { ...this.queryInfo };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach(elem => delete queryObj[elem]);
    console.log('NEW FINAL QUERY: ', queryObj);

    // BEGIN FILTERING THE QUERY (setting up the gte gt, lte, lt)
    // example queryObj:  { price: '397', duration: { gte: '5' } }
    // convert the object to a string...

    let queryStr = JSON.stringify(queryObj);

    // we need the operators signs, `$`... so we put them in using regular expressions...
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    console.log('FINAL QUERY OBJECT...', JSON.parse(queryStr));

    //const allTours = await Tour.find();
    this.query = this.query.find(JSON.parse(queryStr));
    // query results like : find().where().equals().qhere().equals()... lte()...
    return this;
  }
  sort() {
    console.log('sort');
    // APPLY ANY SORTING TO THE QUERY
    if (this.queryInfo.sort) {
      // the 'sort' option was passed through the url...

      // split the strings by commas, and join them by spaces ex: -price,-ratingAverage -> "-price -ratingAverage"
      const sortString = this.queryInfo.sort.split(',').join(' ');
      this.query = this.query.sort(sortString);
    } else {
      // if no sort was specified, then by default we will sort by the 'createdAt' field...
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  limitFields() {
    console.log('select');
    //APPLY SELECTION TO DISPLAY CERTAIN RESULTS

    if (this.queryInfo.fields) {
      const fieldStr = this.queryInfo.fields.split(',').join(' ');
      this.query = this.query.select(fieldStr);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  paginate() {
    console.log('paginate');
    // IMPLEMENT PAGINATION
    const pageNum = this.queryInfo.page * 1 || 1;
    const limit = this.queryInfo.limit * 1 || 100;
    const skip = (pageNum - 1) * limit;
    // page = 3, limit = 10, then skip = 20. because we will skip 20 results, and start at 21, on page 3...
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
