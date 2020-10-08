<template>
  <v-container fill-height>
    <v-layout column justify-center align-center>
      <v-card width="100%" flat color="transparent">
        <v-layout column>
          <v-layout justify-center align-center>
            <v-col>
              <div class="text-sm-center mt-5 display-1" font-weight-bold>Up Local</div>

              <div class="mt-3">Image title</div>
              <v-text-field label="image-title" v-model="title"></v-text-field>
              <div>Upload image</div>

              <v-file-input
                v-model="file"
                label="Select..."
                accept="image/*"
                @change="onFilePicked()"
              >
                <template v-slot:selection="{ text }">
                  <v-chip small label color="primary">{{ text }}</v-chip>
                </template>
              </v-file-input>
              <v-btn
                color="primary"
                :disabled="this.file === null || this.title === ''"
                @click.stop="onUpload"
              >UPLOAD</v-btn>
            </v-col>
          </v-layout>

          <v-card-title primary-title>
            <h3 class="headline mb-0">Result</h3>
          </v-card-title>

          <v-container fluid>
            <v-layout wrap justify-center align-center>
              <!-- <v-col
                ref="rel"

                v-for="imgSrc in sources"
                :key="imgSrc.index"
              >
              -->

              <template>
                <v-container>
                  <v-row align="center" justify="center">
                    <v-col v-for="imgSrc in sources" :key="imgSrc.id" cols="12" md="4" sm="6">
                      <v-card>
                        <v-img
                          :src="imgSrc.blobURL"
                          class="white--text align-end"
                          gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                          height="200px"
                        >
                          <v-card-title v-text="imgSrc.title"></v-card-title>
                        </v-img>
                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn icon @click="removeFile(imgSrc)">
                            <v-icon>mdi-close</v-icon>
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-container>
              </template>

              <!-- <img id="blobbyImg" :src="imgSrc.blobURL" width="200px" /> -->
            </v-layout>
          </v-container>
        </v-layout>
      </v-card>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      sources: [],
      imageURL: '',
      title: '',
      file: null,
      test: [],
      blob: []
    }
  },
  computed: {},
  methods: {
    removeFile(imgSrc) {
      // console.log(imgSrc)
      self = this
      this.db
        .get(imgSrc.id, imgSrc.rev)
        .then(function(doc) {
          console.log(doc)
          doc._deleted = true
          self.db.put(doc)
          setTimeout(() => {
            // self.sources.filter(doc => doc === doc)
            self.sources.splice(self.sources.indexOf(imgSrc), 1)
          }, 100)
        })
        .then(function(result) {
          // handle result
          console.log(result)
        })
        .catch(function(err) {
          console.log(err)
        })
    },

    onFilePicked() {
      let reader = new FileReader()
      reader.onload = () => {
        this.url = reader.result
      }
      reader.readAsDataURL(this.file)
    },

    onUpload() {
      var attachmentID = this.file.name

      var imgSrc = {
        _id: new Date().toISOString(),
        title: this.title,
        _attachments: {
          [attachmentID]: {
            content_type: this.file.type,
            data: new Blob([this.file], { type: this.file.type })
          }
        }
      }

      // var attachment =
      this.db
        .put(imgSrc)
        .then(function(result) {
          console.log(result)
        })
        .catch(function(err) {
          console.log(err)
        })

      this.title = ''
      this.file = null
    },

    preview() {
      self = this
      this.db
        .allDocs({
          include_docs: true,
          attachments: true,
          descending: true,
          binary: true
        })
        .then(function(result) {
          var imgData = ''
          imgData = result.rows.map(row => row.doc)
          var each = ''
          each = imgData.map(key => key._attachments)

          for (const key of imgData) {
            for (var k in key._attachments) {
              self.db.getAttachment(key._id, k).then(function(blob) {
                var blobURL = self.blobUtil.createObjectURL(blob)

                var found = self.sources.find(source => source.id === key._id)

                if (found == undefined) {
                  self.sources.push({
                    blobURL: blobURL,
                    id: key._id,
                    rev: key._rev,
                    title: key.title
                  })
                }
              })
            }
          }
        })
    }
  },

  mounted() {
    this.preview()
  },
  created() {
    console.log(this.$refs)
    //Update whenever remote data change
    this.db
      .changes({
        since: 'now',
        live: true
      })
      .on('change', this.preview)
  }
}
</script>
