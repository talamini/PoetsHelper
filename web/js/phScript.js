function PHCtrl($scope, $http) {
//for debugging only
window.MY_SCOPE = $scope;

	var nodes = [];
	var links = [];
	
	$scope.inputWord = 'mandate';
	$scope.suggestions = [];

	$scope.advanced = false;
	$scope.input = {};
	$scope.input.blueWord = 'mandate';
	$scope.input.redWord = 'deep';

	$scope.status = {};
	$scope.status.redSynonymsCount = 0;
	$scope.status.blueSynonymsCount = 0;
	$scope.status.showSynonymsCount = false;
	$scope.status.showWaitingSpinner = false;
	$scope.status.message = "";
	$scope.status.messageFA = "";

	$scope.bigRedList = [];
	$scope.bigBlueList = [];
	$scope.bigRedListIsComplete = false;
	$scope.bigBlueListIsComplete = false;

	$scope.redSuggestions = [];
	$scope.blueSuggestions = [];

	function getRhymes(word, callback) {

		$http({method: 'GET', 
			url: externalAddresses.heroku + '/rhymes/' + word,
			transformResponse: [function(data){return data;}]
			}).
			success(function(data, status, headers, config) {
				
				var isWord = /\w/;

				var rhymes = data
					.split('\"')
					.filter(function(v){
					return isWord.test(v);
					})
					.map(function(v){
					return v.split('(')[0].toLowerCase();
					});
					
				callback(rhymes);				
			})
			.error(function(data){
				console.info("error!");
			});
	
	}


	function getSynonyms(word, callback) {

		$http({method: 'GET', 
			url: externalAddresses.heroku + '/synonyms/' + word,
			transformResponse: [function(data){return data;}]
			}).
			success(function(data, status, headers, config) {

				var syn = data;
				
				var isWord = /\w/;

				var synonyms = syn
					.split('\"')
					.filter(function(v){
						return isWord.test(v);
					})
					.map(function(v){
						return v.split('(')[0].toLowerCase();
					});

				synonyms.shift();
				
				callback(synonyms);
				
			})
			.error(function(data){
				console.info("Welp, there's been an error.");
			});
	
	}
	


  $scope.easyButtonClick = function() {

  	$scope.redSuggestions = [];
  	$scope.blueSuggestions = [];
  	$scope.status.blueSynonymsCount = 0;
  	$scope.status.blueSynonymsTotal = 0;
  	$scope.status.redSynonymsCount = 0;
  	$scope.status.redSynonymsTotal = 0;
  	$scope.status.showWaitingSpinner = true;
  	$scope.status.message = "";
  	$scope.status.messageFA = "";
  	$scope.bigBlueList.length = 0;
  	$scope.bigRedList.length = 0;

    getSynonyms($scope.input.blueWord, function(synonyms) {
        $scope.input.blueWord = $scope.input.blueWord.toLowerCase();
        console.log("just got " + synonyms.length + " synonyms to " + $scope.input.blueWord);
        $scope.status.showSynonymsCount = true;
        $scope.status.showWaitingSpinner = false;
        $scope.status.blueSynonymsTotal = synonyms.length;
        if (synonyms.length == 0) {
            $scope.status.message = "I couldn't find " + $scope.input.blueWord + " in my thesaurus";
            $scope.status.messageFA = "fa fa-exclamation-circle fa-lg";
        }
        synonyms.map(function(v, i){

            getRhymes(v, function(rhymes){
                $scope.status.blueSynonymsCount++;

                $scope.bigBlueList.push({word: v, rhymes: rhymes});
                if ($scope.bigBlueList.length == synonyms.length) {
                    $scope.bigBlueListIsComplete = true;
                    if ($scope.bigRedListIsComplete) {
                        $scope.bigBlueListIsComplete = false;
                        $scope.bigRedListIsComplete = false;
                        bothListsComplete();
                    }
                }
            });
        });
    });

    getSynonyms($scope.input.redWord, function(synonyms) {
        $scope.input.redWord = $scope.input.redWord.toLowerCase();
        console.log("just got " + synonyms.length + " synonyms to " + $scope.input.redWord);
        $scope.status.redSynonymsTotal = synonyms.length;
        if (synonyms.length == 0) {
            $scope.status.message = "I couldn't find " + $scope.input.redWord + " in my thesaurus";
            $scope.status.messageFA = "fa fa-exclamation-circle fa-lg";
        }
        synonyms.map(function(v, i){

            getRhymes(v, function(rhymes){
                $scope.status.redSynonymsCount++;
                $scope.bigRedList.push({word: v, rhymes: rhymes});
                    if ($scope.bigRedList.length == synonyms.length) {
                        $scope.bigRedListIsComplete = true;
                        if ($scope.bigBlueListIsComplete) {
                            $scope.bigBlueListIsComplete = false;
                            $scope.bigRedListIsComplete = false;
                            bothListsComplete();
                        }
                    }
            });
        });
    });

  }

  function bothListsComplete() {
console.info("Both lists are complete");
    var flatRedRhymes = [];
    //var flatBlueRhymes = [];
    //var flatRedSynonyms = [];
    var flatBlueSynonyms = [];

    for (i in $scope.bigRedList) {
        flatRedRhymes = flatRedRhymes.concat(
            $scope.bigRedList[i].rhymes.map(function(v){
                return {word: v, cameFrom: $scope.bigRedList[i].word}
            })

        );
        //flatRedSynonyms.push($scope.bigRedList[i].word);
    }

    for (i in $scope.bigBlueList) {
        /*flatBlueRhymes = flatBlueRhymes.concat(

            $scope.bigBlueList[i].rhymes.map(function(v){
                return {word: v, cameFrom: $scope.bigBlueList[i].word}
            })
        );*/
        flatBlueSynonyms.push($scope.bigBlueList[i].word);
    }

    console.info(flatBlueSynonyms.length + "    " + flatRedRhymes.length);

    //we want to find red rhymes equal to blue synonyms & vice versa

    /*$scope.redSuggestions = flatBlueRhymes.filter(function(n) {
        return flatRedSynonyms.indexOf(n.word) !== -1;
    });*/


    var temp = flatRedRhymes.filter(function(n) {
        return flatBlueSynonyms.indexOf(n.word) !== -1;
    });

    $scope.blueSuggestions = temp.filter(function(v) {
        return (v.word !== v.cameFrom);
    })

    if ($scope.blueSuggestions.length > 0) {
      $scope.status.message = "Here are " + $scope.blueSuggestions.length + " rhyming synonyms";
      $scope.status.messageFA = "fa fa-check-circle fa-lg";
    } else {
      $scope.status.message = "Sorry, I couldn't find any intersections.";
      $scope.status.messageFA = "fa fa-exclamation-circle fa-lg";
    }
  }

  $scope.buttonClick = function() {
    console.info($scope.inputWord);

	/*var nodes = $scope.wordBubbles;
	var links = $scope.wordBubbles
		.map(function(v, i){
			if (i < $scope.wordBubbles.length - 1) {
				return {source: i, target: (i + 1)};
			}
		})
		.filter(function(v){
			return !!v;
		});*/
		
	nodes = [{text: $scope.inputWord.toLowerCase()}];

		getSynonyms($scope.inputWord, function(synonyms) {
			console.info("got synonyms!")
			console.info(synonyms);
			
			synonyms.map(function(v, i){
				//nodes.push({text: v});
				//links.push({source: 0, target: i + 1});
				
				getRhymes(v, function(rhymes){
					$scope.suggestions.push({word: v, rhymes: rhymes});
					console.info(v + ": ");
					console.info(rhymes);
				});
				
			});
			
			//draw();
			
		});
		
		/*getRhymes($scope.inputWord, function(rhymes) {
			console.info("got rhymes!");
			console.info(rhymes);
		});*/
	
  }

}