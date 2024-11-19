exports.success = (res, data, message = 'Success') => {
    res.status(200).json({ success: true, message, data });
  };
  
  exports.error = (res, message = 'Error', error) => {
    console.error(error);
    res.status(500).json({ success: false, message });
  };
  