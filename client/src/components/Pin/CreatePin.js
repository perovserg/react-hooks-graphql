import React, { useState, useContext } from "react";
import axios from 'axios';
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import AddAPhotoIcon from "@material-ui/icons/AddAPhotoTwoTone";
import LandscapeIcon from "@material-ui/icons/LandscapeOutlined";
import ClearIcon from "@material-ui/icons/Clear";
import SaveIcon from "@material-ui/icons/SaveTwoTone";

import { unstable_useMediaQuery as useMediaQuery } from "@material-ui/core/useMediaQuery";

import Context from '../../context';
import { useClient } from "../../clientGraphQL"; // custom hook !!!
import { CREATE_PIN_MUTATION } from "../../graphql/mutations";

import config from '../../config';

const CreatePin = ({ classes }) => {

  const mobileSize = useMediaQuery('(max-width: 650px)');

  const clientGraphQL = useClient();

  const { state, dispatch } = useContext(Context);

  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = async () => {

    const data = new FormData();

    data.append('file', image);
    data.append('upload_preset', config.CLOUDINARY_UPLOAD_PRESET);
    data.append('cloud_name', config.CLOUDINARY_CLOUD_NAME);

    const res = await axios.post(config.CLOUDINARY_CLOUD_UPLOAD_URL, data);

    return res.data.url;

  };

  const handleSubmit = async (event) => {
    try {

      event.preventDefault();

      setSubmitting(true);

      const url = await handleImageUpload();

      const { latitude, longitude } = state.draft;

      const variables = { title, image: url, content, latitude, longitude};

      await clientGraphQL.request(CREATE_PIN_MUTATION, variables);

      handleDeleteDraft();

    } catch (error) {
      setSubmitting(false);
      console.error('Error creating pin', error);
    }

  };

  const handleDeleteDraft = () => {
      setTitle('');
      setImage('');
      setContent('');

      dispatch({ type: 'DELETE_DRAFT'});
  };

  return (
      <form className={classes.form}>
        <Typography
          className={classes.alignCenter}
          component="h2"
          variant="h4"
          color="secondary"
        >
          <LandscapeIcon className={classes.iconLarge}/>
          Pin Location
        </Typography>
        <div>
          <TextField
              name="title"
              label='Title'
              placeholder='Insert pin title'
              onChange={event => setTitle(event.target.value)}
          />
          <input
            accept='image/*'
            id='image'
            type='file'
            className={classes.input}
            onChange={event => setImage(event.target.files[0])}
          />
          <label htmlFor='image'>
            <Button
                style={{ color: image && 'green'}}
                component='span'
                size='small'
                className={classes.button}
            >
              <AddAPhotoIcon/>
            </Button>
          </label>
        </div>
        <div className={classes.contentField}>
          <TextField
              name='content'
              label='Content'
              multiline
              rows={mobileSize ? '3' : '6'}
              margin='normal'
              fullWidth
              variant='outlined'
              onChange={event => setContent(event.target.value)}
          />
        </div>
        <div>
          <Button
              className={classes.button}
              variant='contained'
              color='primary'
              onClick={handleDeleteDraft}
          >
            <ClearIcon className={classes.leftIcon}/>
            Discard
          </Button>
          <Button
              type='submit'
              className={classes.button}
              variant='contained'
              color='secondary'
              //проверка на заполненность полей
              disabled={!title.trim() || !content.trim() || !image || submitting}
              onClick={handleSubmit}
          >
            <SaveIcon className={classes.rightIcon}/>
            Submit
          </Button>
        </div>
      </form>
  );
};

const styles = theme => ({
  form: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    paddingBottom: theme.spacing.unit
  },
  contentField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: "95%"
  },
  input: {
    display: "none"
  },
  alignCenter: {
    display: "flex",
    alignItems: "center"
  },
  iconLarge: {
    fontSize: 40,
    marginRight: theme.spacing.unit
  },
  leftIcon: {
    fontSize: 20,
    marginRight: theme.spacing.unit
  },
  rightIcon: {
    fontSize: 20,
    marginLeft: theme.spacing.unit
  },
  button: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit,
    marginLeft: 0
  }
});

export default withStyles(styles)(CreatePin);
