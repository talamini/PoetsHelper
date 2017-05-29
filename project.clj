(defproject poetshelper "0.1.1"
  :description "A Helper for Poets"
  :url "none"
  :license {:name "none"
            :url "none"}
  :min-lein-version "2.0.0"
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [org.clojure/math.numeric-tower "0.0.4"]
                 [http-kit "2.2.0"]
                 [aleph "0.3.2"]
                 [ring "1.1.5"]]
  :main ^:skip-aot poetshelper.core
  :target-path "target/%s"
  :profiles {:uberjar {:aot :all}})
