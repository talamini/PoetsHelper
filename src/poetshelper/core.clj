(ns poetshelper.core
  (:require [clojure.string :as str]
            [org.httpkit.server :as httpkit]))

(println "Slurping dict.txt")
(def dict-vector
  (-> (slurp "resources/dict.txt")
      (str/replace #"2" "0")
      (str/split #"\n")))

(def every-index (range (count dict-vector)))

(defn index->entry [n]
  (nth dict-vector n))

(defn pronunciation [n]
  (-> (index->entry n)
      (str/split #"  ")
      (nth 1)
      (str/trim-newline)))

(defn rhyme [n]
  (re-seq #"\w\w1[^1]*$" (pronunciation n)))

;input an index number, outputs a vector like [:rhyme index]
(defn index->rhyme-keyword [n]
  [(-> (rhyme n)
       first
       keyword)
   n])

(println "Making big rhyme lookup table...")
(def big-list-rhyme->index
  (map index->rhyme-keyword every-index))

(defn index->entry [n]
  (nth dict-vector n))

(defn spelling [s]
  (-> (index->entry s)
      (str/split #"  ")
      (nth 0)))

(defn r->i [rhyme-keyword]
  (map second
       (filter
         (fn [x] (= rhyme-keyword (first x)))
         big-list-rhyme->index)))

;input an index number, outputs a map like {:spelling index}
(defn index->spelling [x]
  {(keyword (spelling x))
   x})

;hash-map with unique words as keys and pronunciation numbers as values, like {:GHOST 47165, etc}
(println "Making dictionary hash map...")
(def spelling->index
  (reduce merge (map index->spelling every-index)))

;takes a word spellings & spits out rhyming word spellings.  For human use.
(defn get-rhymes [s]
  (map spelling
       (-> s
           (str/upper-case)
           (keyword)
           (spelling->index)
           (index->rhyme-keyword)
           (nth 0)
           (r->i))))

(println "Reading thesaurus...")
(def thesaurus
  (read-string
    (slurp "resources/thesaurus.txt")))

(defn get-synonyms [s]
  (map spelling
       (get thesaurus s)))

(defn respond-to-request [input]
  (println "Request received; responding now")
  (let [doable-functions
        {"rhymes",      get-rhymes
         "synonyms",    get-synonyms}
        which-function-to-do
        (-> (re-seq #"\/(\w+)"
                    (input :uri))
            (nth 0)
            (nth 1))
        word
        (-> (re-seq #"\/([a-zA-Z']+)"
                    (input :uri))
            (nth 1)
            (nth 1))]

    (when (contains? doable-functions which-function-to-do)
      (println "doing function: " which-function-to-do " on: " word)
      (vec ((get doable-functions which-function-to-do) word)))))

(defn start-server [port]

  (let [poetshelper-server
        (fn [request]
          {:status  200
           :headers {"Content-Type"                 "text/plain"
                     "Access-Control-Allow-Origin"  "*"}
           :body    (str
                      (respond-to-request request))})]

    (println "Starting server on port " port)
    (httpkit/run-server poetshelper-server {:port port})))

(defn -main [& [port]]
  (let [port (Integer. (or port (env :port) 5000))]
    (start-server port)))

(defn -from-proc-file [$ [port]]
  (println "I'm coming from the proc file and I know about ")
  (println port))