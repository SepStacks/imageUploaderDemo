<template>
  <v-container
    fill-height
    fluid
    class="px-5"
  >
    <v-card
      width="100%"
      flat
      color="transparent"
    >
      <v-row column align="center" justify="center">
        <v-col cols="12" md="4">
          <v-row justify="center">
            <v-col>

              <div class="mt-3 font-weight-bold text-uppercase ">Image title</div>
              <v-text-field
                label="image-title"
                class="text-uppercase"
                v-model="title"
              ></v-text-field>
              <div class="font-weight-bold text-uppercase">Upload image</div>

              <v-file-input
                class="text-uppercase"
                v-model="file"
                label="Select..."
                accept="image/*"
                @change="onFilePicked()"
              >
                <template v-slot:selection="{ text }">
                  <v-chip
                    small
                    label
                    color="primary"
                  >{{ text }}</v-chip>
                </template>
              </v-file-input>
              <v-btn
                color="primary"
                :disabled="this.file === null || this.title === ''"
                @click.stop="onUpload"
              >UPLOAD</v-btn>
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="12" md="6"   id="scrolling-techniques-6"
      class="overflow-y-auto"
      max-height="600">

          <v-container  style="height: 500px;">
            <v-row
              align="center"
              justify="center"
              v-if="sources.length > 0"
            >
              <v-col
                v-for="imgSrc in sources"
                :key="imgSrc.id"
                class="d-flex child-flex"
                cols="12"
                lg="4"
                md="6"
                sm="12"
              >
                <v-card >
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      icon
                      @click="removeFile(imgSrc)"
                    >
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </v-card-actions>
                  <v-img

                     max-height="150"
                    max-width="250"
                    :src="imgSrc.blobURL"
                    class="white--text align-end"
                    gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                  >
                   <v-card-title v-text="imgSrc.title"></v-card-title>
                      <!-- <span
                class="headline white--text pl-4 pt-4 d-inline-block"
                v-text="card"
              ></span> -->

                    <template v-slot:placeholder>
                      <v-row
                        class="fill-height ma-0"
                        align="center"
                        justify="center"
                      >
                        <v-progress-circular
                          indeterminate
                          color="grey lighten-5"
                        ></v-progress-circular>
                      </v-row>
                    </template>
                  </v-img>

                </v-card>
              </v-col>
            </v-row>

            <v-row v-else>
              <div> NO IMAge</div>
            </v-row>

          </v-container>

        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script>
export default {
  data () {
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
    removeFile (imgSrc) {
      // console.log(imgSrc)
      self = this
      this.db
        .get(imgSrc.id, imgSrc.rev)
        .then(function (doc) {
          console.log(doc)
          doc._deleted = true
          self.db.put(doc)
          setTimeout(() => {
            // self.sources.filter(doc => doc === doc)
            self.sources.splice(self.sources.indexOf(imgSrc), 1)
          }, 100)
        })
        .then(function (result) {
          // handle result
          console.log(result)
        })
        .catch(function (err) {
          console.log(err)
        })
    },

    onFilePicked () {
      let reader = new FileReader()
      reader.onload = () => {
        this.url = reader.result
      }
      reader.readAsDataURL(this.file)
    },

    onUpload () {
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
        .then(function (result) {
          console.log(result)
        })
        .catch(function (err) {
          console.log(err)
        })

      this.title = ''
      this.file = null
    },

    preview () {
      self = this
      this.db
        .allDocs({
          include_docs: true,
          attachments: true,
          descending: true,
          binary: true
        })
        .then(function (result) {
          var imgData = ''
          imgData = result.rows.map(row => row.doc)
          var each = ''
          each = imgData.map(key => key._attachments)

          for (const key of imgData) {
            for (var k in key._attachments) {
              self.db.getAttachment(key._id, k).then(function (blob) {
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

  mounted () {
    this.preview()
  },
  created () {
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
