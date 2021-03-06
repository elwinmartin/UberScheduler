angular.module('ridesCtrl', ['ui.bootstrap'])
.controller('ridesCtrl', function ($scope, $ionicPopup, $timeout) {

  $scope.isCollapsed = false;


  //MODAL SHIZ STUFF FOR UI BOOTSTRAP
  $scope.items = ['item1', 'item2', 'item3'];

  $scope.animationsEnabled = true;

  $scope.open = function (size) {

    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  $scope.toggleAnimation = function () {
    $scope.animationsEnabled = !$scope.animationsEnabled;
  };


  $scope.toggleShow = function (index) {
    for (var i = 0; i < $scope.scheduledRides.length; i++) {
      if (i == index) {
        var previous = $scope.scheduledRides[i].showOptions;
        $scope.scheduledRides[i].showOptions = !previous;
        // console.log("Toggling to:", !previous); //Feedback
      }
    }
  };


  $scope.reverseGeocode = function (lat, lng) {
    var geocoder = new google.maps.Geocoder;
    var latlng = {
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    }
    console.log("Geocode lookup started")
    geocoder.geocode({
      'location': latlng
    }, function (results, status) {
      console.log("Lookup finished")
      debugger
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          var address = results[1].formatted_address;
          return address
        } else {
          console.log("No results found");
          return "No address found"
        }
      } else {
        console.log("Geocoder failed due to:", status);
        return "Address lookup failed"
      }
    });
  };


  $scope.newScheduledRide = function () {
    // console.log("Adding new scheduled rides");
    var currentTime = new Date().getTime(); //Number of seconds since Jan 1, 1970
    var defaultRepeat = [false, true, false, true, false, true, false];
    $scope.scheduledRides.push(
      {
        time: currentTime,
        pickupLocation: [34.07636433, -118.4290661],
        pickupName: ["10236 Charing Cross Rd", "Los Angeles", "CA", "90024"], //Will declare this variable when the location is selected on the map
        dropLocation: [34.07636433, -118.4290661],
        dropName: ["10236 Charing Cross Rd", "Los Angeles", "CA", "90024"],
        repeatedDays: defaultRepeat,
        startDate: new Date(2016, 01, 01), //Months indexed from 0
        endDate: new Date(2016, 3, 01),
        nextRide: $scope.findNextRide(currentTime, defaultRepeat),
        product: 1,
        showOptions: true //Show options when adding new schedule
      }
    )
  };

  $scope.pushRidesToServer = function () {

    /*********      Conversions     *********/
    //Convert the nextRide variable into a number readable by the server
    //Convert the time variable into an integer
    var data = $scope.scheduledRides; //The data variable will be sent
    for (var i = 0; i < data.length; i++) {
      //time conversion
      var time = data[i].time;
      var ray = [time.getHours(), time.getMinutes()];
      data[i].time = ray; //Assign to object

      //nextRide conversion
      var nextRide = data[i].nextRide;
      var num = Date.parse(nextRide);
      data[i].nextRide = num; //Assign to object
    }
    ;
    /*********      Conversion Complete     *********/
    console.log("Sending data:") //Feedback
    console.log(data)

    /*********      Pushing to Server     *********/
  };

  $scope.UberTypes = ["UberX", "UberBlack", "UberBlack", "ACCESS"];
  $scope.daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  $scope.scheduledRides = [
    {
      time: new Date(2016, 0, 1, 2, 3, 4, 567),
      pickupLocation: [34.07636433, -118.4290661],
      pickupName: ["10236 Charing Cross Rd", "Los Angeles", "CA", "90024"], //Will declare this variable when the location is selected on the map
      dropLocation: [34.07636433, -118.4290661],
      dropName: ["10236 Charing Cross Rd", "Los Angeles", "CA", "90024"],
      repeatedDays: [false, true, false, true, false, true, false],
      startDate: new Date(2016, 01, 01), //Months indexed from 0
      endDate: new Date(2016, 2, 01),
      nextRide: new Date(findNextRide(new Date(2016, 0, 1, 2, 3, 4, 567), [false, true, false, true, false, true, false])), //Calculated on spot because these are tests
      product: 1,
      showOptions: true
    },
    {
      time: new Date(2016, 0, 1, 18, 32, 5, 567),
      pickupLocation: [34.07636433, -118.4290661],
      pickupName: ["10236 Charing Cross Rd", "Los Angeles", "CA", "90024"],
      dropLocation: [34.07636433, -118.4290661],
      dropName: ["10236 Charing Cross Rd", "Los Angeles", "CA", "90024"],
      repeatedDays: [false, true, false, true, false, true, false],
      startDate: new Date(2016, 01, 01),
      endDate: new Date(2016, 4, 01),
      nextRide: new Date(findNextRide(new Date(2016, 0, 1, 18, 32, 5, 567), [false, true, false, true, false, true, false])),
      product: 2,
      showOptions: false
    }
  ];
  //POPUP SEXY ACTION STUFF
  // Triggered on a button click, or some other target

  // A confirm dialog
  $scope.selectDate = function (varToChange, scheduleNum) {

    var previousValue;

    switch (varToChange) {
      case "startDate":
        previousValue = new Date($scope.scheduledRides[scheduleNum].startDate);
        break;
      case "endDate":
        previousValue = new Date($scope.scheduledRides[scheduleNum].endDate);
        break;
      default:
        console.log("Found no variable to change")
    }

    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var dateString = days[previousValue.getDay()] + ", " + months[previousValue.getMonth()] + ", " + previousValue.getDay() + ", " + previousValue.getFullYear();


    var calendarPopup = $ionicPopup.alert({
      title: 'Please Select a Date',
      template: '<h5>Previous Date: ' + dateString + '</h5><h5>Date Selected: <span id="dateValue">{{dt | date:"fullDate" }}</span></h5><div style="display:inline-block; min-height:290px;">' +
      '<uib-datepicker ng-model="dt" min-date="minDate" show-weeks="true" class="well well-sm" custom-class="getDayClass(date, mode)"></uib-datepicker>' +
      '</div>',
      okText: 'Confirm',
      okType: 'button-positive'
    });

    calendarPopup.then(function (res) {
      var date = document.getElementById('dateValue').innerHTML; //The scope variable doesn't update for some reason so I'm doing something really jank
      if (date == "") { //If didn't select a date
        console.log("Did not select a date");
        date = previousValue; //Set it back to old value
      }
      $scope.dt = date; //Assign scope variable

      //The date value can be retrieved in the modal itself so I'm assigning an ID to it
      //Then I call the value of the respective tag - it gives me the correct date
      switch (varToChange) {
        case "startDate":
          console.log("Changing start date for schedule", scheduleNum, "to", date);
          $scope.scheduledRides[scheduleNum].startDate = date;
          break;
        case "endDate":
          console.log("Changing end date for schedule", scheduleNum, "to", date);
          $scope.scheduledRides[scheduleNum].endDate = date;
          break;
        default:
          console.log("Found no variable to change")
      }
    });
  };


  $scope.today = function () {
    $scope.dt = new Date();
  };
  $scope.today();

  $scope.clear = function () {
    $scope.dt = null;
  };

  // Disable weekend selection
  $scope.disabled = function (date, mode) {
    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
  };

  $scope.toggleMin = function () {
    $scope.minDate = $scope.minDate ? null : new Date();
  };

  $scope.toggleMin();
  $scope.maxDate = new Date(2020, 5, 22);

  $scope.open1 = function () {
    $scope.popup1.opened = true;
  };

  $scope.open2 = function () {
    $scope.popup2.opened = true;
  };

  $scope.setDate = function (year, month, day) {
    $scope.dt = new Date(year, month, day);
  };

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];
  $scope.altInputFormats = ['M!/d!/yyyy'];

  $scope.popup1 = {
    opened: false
  };

  $scope.popup2 = {
    opened: false
  };

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var afterTomorrow = new Date();
  afterTomorrow.setDate(tomorrow.getDate() + 1);
  $scope.events = [
    {
      date: tomorrow,
      status: 'full'
    },
    {
      date: afterTomorrow,
      status: 'partially'
    }
  ];

  $scope.getDayClass = function (date, mode) {
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

      for (var i = 0; i < $scope.events.length; i++) {
        var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }

    return '';
  };

})
